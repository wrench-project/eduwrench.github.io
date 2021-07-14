import React, { useEffect, useState } from "react"
import axios from "axios"
import { Form, Label, Segment } from "semantic-ui-react"
import { Formik } from "formik"
import SimulationScenario from "../../../components/simulation_scenario"
import HostUtilizationChart from "../../../components/charts/host_utilization_chart"
import SimulationSignIn from "../../../components/simulation_signin"

import RAMSimulationScenario from "../../../images/svgs/multicore_ram_simulation.svg"

const RAMSimulation = () => {

  const [simulationResults, setSimulationResults] = useState(<></>)
  const [auth, setAuth] = useState("false")

  useEffect(() => {
    setAuth(localStorage.getItem("login"))
  })

  return (
    auth === "true" ? (
      <>
        <SimulationScenario scenario={<RAMSimulationScenario />} />

        <Segment.Group>
          <Segment color="teal"><strong>Simulation Parameters</strong></Segment>
          <Segment>
            <Formik
              initialValues={{
                numCores: 1,
                numTasks: 1,
                taskGflop: 100,
                taskRam: 0
              }}

              validate={values => {
                const errors = {}
                if (!values.numCores || !/^[0-9]+$/i.test(values.numCores) || values.numCores > 32 || values.numCores < 1) {
                  errors.numCores = "ERROR"
                } else if (!values.numTasks || !/^[0-9]+$/i.test(values.numTasks) || values.numTasks > 999 || values.numTasks < 1) {
                  errors.numTasks = "ERROR"
                } else if (!values.taskGflop || !/^[0-9]+$/i.test(values.taskGflop) || values.taskGflop < 1 || values.taskGflop > 999999) {
                  errors.taskGflop = "ERROR"
                } else if (!/^[0-9]+$/i.test(values.taskRam) || values.taskRam < 0 || values.taskRam > 32) {
                  errors.taskRam = "ERROR"
                }
                return errors
              }}

              onSubmit={(values, { setSubmitting }) => {
                setTimeout(() => {
                  if (localStorage.getItem("login") !== "true") {
                    setSimulationResults(<></>)
                    return
                  }
                  const userEmail = localStorage.getItem("currentUser")
                  const data = {
                    userName: userEmail.split("@")[0],
                    email: userEmail,
                    num_cores: values.numCores,
                    num_tasks: values.numTasks,
                    task_gflop: values.taskGflop,
                    task_ram: values.taskRam
                  }
                  setSimulationResults(<></>)
                  axios.post("http://localhost:3000/run/multi_core_independent_tasks_ram", data).then(
                    response => {
                      setSimulationResults(
                        <>
                          <HostUtilizationChart data={response.data.task_data} />
                        </>
                      )
                    },
                    error => {
                      console.log(error)
                      alert("Error executing simulation.")
                    }
                  )
                  setSubmitting(false)
                }, 400)
              }}
            >
              {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  isSubmitting
                }) => (
                <Form onSubmit={handleSubmit}>
                  <Form.Group widths="equal">
                    <Form.Input fluid name="numCores"
                                label="Number of Cores in Compute Node"
                                placeholder="1"
                                type="number"
                                min={1}
                                max={32}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.numCores}
                                error={errors.numCores && touched.numCores ? {
                                  content: "Please provide the number of cores in the compute node in the range of [1, 32].",
                                  pointing: "above"
                                } : null}
                    />
                    <Form.Input fluid name="numTasks"
                                label="Number of Tasks"
                                placeholder="1"
                                type="number"
                                min={1}
                                max={100}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.numTasks}
                                error={errors.numTasks && touched.numTasks ? {
                                  content: "Please provide the number of tasks in the range of [1, 100].",
                                  pointing: "above"
                                } : null}
                    />
                  </Form.Group>
                  <Form.Group widths="equal">
                    <Form.Input fluid name="taskRam"
                                label="Ram Needed For Each Task (GB)"
                                placeholder="0"
                                type="number"
                                min={0}
                                max={32}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.taskRam}
                                error={errors.taskRam && touched.taskRam ? {
                                  content: "Please provide the amount of RAM per task in the range of [0, 32] GB.",
                                  pointing: "above"
                                } : null}
                    />
                    <Form.Input fluid
                                name="taskGflop"
                                label="Task Gflop"
                                placeholder="100"
                                type="number"
                                min={1}
                                max={999999}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.taskGflop}
                                error={errors.taskGflop && touched.taskGflop ? {
                                  content: "Please provide the amount of Gflop per task in the range of [1, 999999].",
                                  pointing: "above"
                                } : null}
                    >
                      <input />
                      <Label basic className="info-label">
                        Host capable of 100 Gflops
                      </Label>
                    </Form.Input>
                  </Form.Group>
                  <Form.Button color="teal" type="submit" disabled={isSubmitting}>Run Simulation</Form.Button>
                </Form>
              )}
            </Formik>
          </Segment>
        </Segment.Group>

        {simulationResults}

      </>
    ) : (
      <SimulationSignIn />
    )
  )
}

export default RAMSimulation