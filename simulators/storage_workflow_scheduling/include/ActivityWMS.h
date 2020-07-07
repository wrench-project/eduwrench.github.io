#ifndef ACTIVITY_WMS_H
#define ACTIVITY_WMS_H

#include <wrench-dev.h>

namespace wrench {

    class Simulation;

    class ActivityWMS : public WMS {
    public:
        ActivityWMS(const std::shared_ptr<FileRegistryService> &file_registry,
                    const std::set<std::shared_ptr<ComputeService>> &compute_services,
                    const std::set<std::shared_ptr<StorageService>> &storage_services,
                    const std::string &hostname);

    private:
        int main() override;

        std::shared_ptr<JobManager> job_manager;

        std::shared_ptr<ComputeService> assignTask(std::shared_ptr<ComputeService>
                                                   compute_service1, std::shared_ptr<ComputeService> compute_service2, double mem_req,
                                                   double num_cores);
    };
};

#endif
