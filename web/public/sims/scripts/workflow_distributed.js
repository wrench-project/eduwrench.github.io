$(function () {

    $("#wf-dist-num-hosts").on("keyup", function () {
        validateFieldInRange($(this), 1, 20, [{className: ".wf-dist-num-hosts-label", pretext: "N=", text: "Hosts"}]);
    });

    $("#wf-dist-num-cores").on("keyup", function () {
        validateFieldInRange($(this), 1, 32, [{className: ".wf-dist-num-cores-label", pretext: "Cores:"}]);
    });

    $('#simulator-form-wf-dist').on('submit', function (event) {
        // we don't want the page reloading, so things look dynamic (this will be nice when we use d3's transitions)
        event.preventDefault();
        disableRunSimulationButton();

        $('.chart').css('display', 'block');

        // remove the graphs, since we will append a new ones to the chart
        $('.chart > svg').remove();

        // get google user information
        let userName = localStorage.getItem("userName");
        let email = localStorage.getItem("email");

        // Upon submission of the form, a POST request containing the user's desired parameters
        // is sent to the node server, where the simulation will be executed with those parameters.
        // Then a response with simulation data is received. The data is parsed, and rendered on the
        // screen. 
        $.ajax({
            url: window.location.protocol + '//' + window.location.hostname + ':3000/run/workflow_distributed',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(
                {
                    num_hosts: $("#wf-dist-num-hosts").val(),
                    num_cores: $("#wf-dist-num-cores").val(),
                    link_bandwidth: "100",
                    use_local_storage: "0",
                    userName: userName,
                    email: email
                }),

            success: function (response) {

                // Add the new simulation output into the "Simulation Output" section
                $("#wf-dist-simulation-output").empty().append(response.simulation_output);

                let executionData = prepareResponseData(response.task_data);
                // generateGanttChart(executionData, 'wf-dist-graph-container');
                generateHostUtilizationChart(executionData, 'wf-dist-host-utilization-chart', [], [], false);
                hostUtilizationData = {
                    data: executionData,
                    containedId: 'wf-dist-host-utilization-chart',
                    hostsList: [],
                    diskHostsList: []
                }

                let prepared_data = prepareData(response.task_data.workflow_execution.tasks);
                // generateGraph(prepared_data, "taskView", 900, 500);
                // generateHostUtilizationGraph(prepared_data, 900, 300, 60);
                populateWorkflowTaskDataTable(prepared_data, 'wf-dist-task-details-table');
            }
        });
    });
});
