$(function () {

    // Update the label that says how many tasks will be run
    $("#mcdp-oil-radius").on("keyup", function () {
        validateFieldInRange($(this), 1, 10, [
            {className: ".mcdp-oil-task-1-label", text: "GFlop"},
            {className: ".mcdp-oil-task-2-label", text: "GFlop"}
        ], function (value) {
            return value * value * 100;
        });
    });

    $("#mcdp-num-cores").on("keyup", function () {
        validateFieldInRange($(this), 1, 100, [
            {className: ".mcdp-num-cores-label", pretext: "Cores:"},
            {className: ".mcdp-data-parallelism-label", pretext: "Data-parallelism with", text: "tasks"}
        ]);
    });

    $('#simulator-form-mcdp').on('submit', function (event) {
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
            url: window.location.protocol + '//' + window.location.hostname + ':3000/run/multi_core_data_parallelism',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(
                {
                    num_cores: $("#mcdp-num-cores").val(),
                    oil_radius: $("#mcdp-oil-radius").val(),
                    userName: userName,
                    email: email
                }),

            success: function (response) {

                // Add the new simulation output into the "Simulation Output" section
                $("#mcdp-simulation-output").empty().append(response.simulation_output);

                let executionData = prepareResponseData(response.task_data);
                // generateGanttChart(executionData, 'mcdp-graph-container');
                generateHostUtilizationChart(executionData, 'mcdp-host-utilization-chart', [], [], false);
                hostUtilizationData = {
                    data: executionData,
                    containedId: 'mcdp-host-utilization-chart',
                    hostsList: [],
                    diskHostsList: []
                }

                // let prepared_data = prepareData(response.task_data.workflow_execution.tasks);
                // populateWorkflowTaskDataTable(prepared_data, "task-details-table", "task-details-table-body",
                //     "task-details-table-td");
            }
        });
    });
});
