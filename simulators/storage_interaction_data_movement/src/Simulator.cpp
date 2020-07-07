#include <iostream>
#include <fstream>
#include <iomanip>
#include <string>
#include <algorithm>

#include <simgrid/s4u.hpp>
#include <wrench.h>
#include <nlohmann/json.hpp>
#include <pugixml.hpp>

#include "ActivityWMS.h"

/**
 * @brief Generates a platform with a single multi-core host
 * @param platform_file_path: path to write the platform file to
 *
 * @throws std::invalid_argumemnt
 */
void generatePlatform(std::string platform_file_path, int link_bandwidth) {

    if (platform_file_path.empty()) {
        throw std::invalid_argument("generatePlatform() platform_file_path cannot be empty");
    }
    if (link_bandwidth < 1 ) {
        throw std::invalid_argument("generatePlatform() bandwidth must be greater than 1");
    }


    // Create a the platform file
    std::string xml_string = "<?xml version='1.0'?>\n"
                             "<!DOCTYPE platform SYSTEM \"http://simgrid.gforge.inria.fr/simgrid/simgrid.dtd\">\n"
                             "<platform version=\"4.1\">\n"
                             "   <zone id=\"AS0\" routing=\"Full\">\n"
                             "       <host id=\"WMSHost\" speed=\"10Gf\" core=\"1\">\n"
                             "       </host>\n"
                             "       <host id=\"ServerHost\" speed=\"100Gf\" core=\"1000\">\n"
                             "           <prop id=\"ram\" value=\"32GB\"/>\n"
                             "           <disk id=\"large_disk\" read_bw=\"50MBps\" write_bw=\"50MBps\">\n"
                             "                            <prop id=\"size\" value=\"5000GiB\"/>\n"
                             "                            <prop id=\"mount\" value=\"/\"/>\n"
                             "           </disk>\n"
                             "       </host>\n"
                             "       <host id=\"ClientHost\" speed=\"100f\" core=\"1\">\n"
                             "           <disk id=\"hard_disk\" read_bw=\"100000TBps\" write_bw=\"100000TBps\">\n"
                             "                            <prop id=\"size\" value=\"5000GiB\"/>\n"
                             "                            <prop id=\"mount\" value=\"/\"/>\n"
                             "           </disk>\n"
                             "       </host>\n"
                             "       <link id=\"network_link\" bandwidth=\"20MBps\" latency=\"20us\"/>\n"
                             "       <route src=\"WMSHost\" dst=\"ClientHost\">"
                             "           <link_ctn id=\"network_link\"/>"
                             "       </route>\n"
                             "       <route src=\"WMSHost\" dst=\"ServerHost\">"
                             "           <link_ctn id=\"network_link\"/>"
                             "       </route>\n"
                             "       <route src=\"ClientHost\" dst=\"ServerHost\">"
                             "           <link_ctn id=\"network_link\"/>"
                             "       </route>\n"
                             "   </zone>\n"
                             "</platform>\n";


    pugi::xml_document xml_doc;

    if (xml_doc.load_string(xml_string.c_str(), pugi::parse_doctype)) {

        pugi::xml_node link = xml_doc.child("platform").child("zone").child("link");

        link.attribute("bandwidth").set_value(std::string(std::to_string(link_bandwidth) + "MBps").c_str());

        xml_doc.save_file(platform_file_path.c_str());

    } else {
        throw std::runtime_error("something went wrong with parsing xml string");
    }
}

/**
 *
 * @param argc
 * @param argvx
 * @return
 */
int main(int argc, char** argv) {

    wrench::Simulation simulation;
    simulation.init(&argc, argv);

    int SERVER_LINK_BANDWIDTH;
    int FILE_SIZE;
    const double MB = 1000.0 * 1000.0;

    try {

        if (argc != 3) {
            throw std::invalid_argument("invalid number of arguments");
        }

        SERVER_LINK_BANDWIDTH = std::stoi(std::string(argv[1]));
        if (SERVER_LINK_BANDWIDTH < 1 || SERVER_LINK_BANDWIDTH > 1000000) {
            std::cerr << "Invalid server1 link bandwidth. bandwidth must be in range [1,1000000] MBps" << std::endl;
            throw std::invalid_argument("invalid server1 link bandwidth");
        }

        FILE_SIZE = std::stoi(std::string(argv[2]));

        if (FILE_SIZE <  1 || FILE_SIZE > 10000) {
            std::cerr << "Invalid file size. Size must be in range [1,10000] MB" << std::endl;
            throw std::invalid_argument("Invalid file size.");
        }


    } catch(std::invalid_argument &e) {
        std::cerr << e.what() << std::endl;
        std::cerr << "Usage: " << argv[0] << " <server_link_bandwidth> <file_size>" << std::endl;
        std::cerr << "   server_link_bandwidth: Bandwidth must be in range [1,1000000] MBps" << std::endl;
        std::cerr << "   file size: File size must be in range [1,100000] MBps" << std::endl;
        std::cerr << "" << std::endl;
        return 1;
    }

    // create workflow
    wrench::Workflow workflow;
    workflow.addFile("file_copy", FILE_SIZE*MB);

    // read and instantiate the platform with the desired HPC specifications
    std::string platform_file_path = "/tmp/platform.xml";
    generatePlatform(platform_file_path, SERVER_LINK_BANDWIDTH);
    simulation.instantiatePlatform(platform_file_path);


    const std::string CLIENT("ClientHost");
    const std::string WMS("WMSHost");
    const std::string SERVER("ServerHost");

    auto client_storage_service = simulation.add(new wrench::SimpleStorageService(CLIENT, {"/"}, {{wrench::SimpleStorageServiceProperty::BUFFER_SIZE, "50000000"}}));
    auto server_storage_service = simulation.add(new wrench::SimpleStorageService(SERVER, {"/"}, {{wrench::SimpleStorageServiceProperty::BUFFER_SIZE, "50000000"}}));

    std::set<std::shared_ptr<wrench::StorageService>> storage_services;
    storage_services.insert(client_storage_service);
    storage_services.insert(server_storage_service);


    auto file_registry = new wrench::FileRegistryService(WMS);
    simulation.add(file_registry);
    auto wms = simulation.add(new wrench::ActivityWMS({storage_services}, WMS));

    wms->addWorkflow(&workflow);

    auto file = workflow.getFileByID("file_copy");
    simulation.stageFile(file, client_storage_service);

    simulation.launch();

    // Gather the data transfer completion times
    auto file_copy_starts = simulation.getOutput().getTrace<wrench::SimulationTimestampFileCopyStart>();

    std::cerr << "----------------------------------------" << std::endl;
    std::cerr.precision(4);

    for (const auto &file_copy : file_copy_starts) {
        double start_time = file_copy->getDate();
        double end_time = file_copy->getContent()->getEndpoint()->getDate();
        double duration = end_time - start_time;

        std::cerr << file_copy->getContent()->getFile()->getSize() / (1000.0 * 1000.0) <<
        " MB transfer completed at time " << duration << std::endl;
    }
    std::cerr << "----------------------------------------" << std::endl;

    return 0;
}
