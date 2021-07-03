import React, { useState } from "react"
import Layout from "../../components/layout"
import Seo from "../../components/seo"
import { Segment, Tab } from "semantic-ui-react"
import 'katex/dist/katex.min.css';
import "./pedagogic_modules.css"

import WorkAndSpeed from "./include_single_core_computing/work_and_speed"
import TimeSharing from "./include_single_core_computing/time_sharing"
import Memory from "./include_single_core_computing/memory"
import IO from "./include_single_core_computing/io"
import Capstone from "./include_single_core_computing/capstone"

const SingleCoreComputing = () => {
  return (
    <Layout>
      <Seo title="A.1. Single-core Computing" />
      <h2 style={{
        marginBottom: `30px`,
        marginTop: `50px`,
        color: "#525252"
      }}><br />A.1. Single-core Computing </h2>

      <Segment style={{ marginBottom: "2em" }}>
        The goal of this module is to provide you with basic knowledge about sequential computing (i.e., running a
        program on a single core).
        <br /><br />
        There is a lot of complexity under the cover, which belongs in Computer Architecture and Operating Systems{" "}
        <a className="link" href="/textbooks/"> textbooks </a> . Instead, we take a high-level approach, with a focus on
        performance.
        <br /><br />
        Go through the tabs below in sequence…
      </Segment>

      <Tab className="tab-panes" panes={[
        {
          menuItem: "Work and Speed",
          render: () => <Tab.Pane><WorkAndSpeed /></Tab.Pane>
        },
        {
          menuItem: "Time Sharing",
          render: () => <Tab.Pane><TimeSharing /></Tab.Pane>
        },
        {
          menuItem: "Memory",
          render: () => <Tab.Pane><Memory /></Tab.Pane>
        },
        {
          menuItem: "I/O",
          render: () => <Tab.Pane><IO /></Tab.Pane>
        },
        {
          menuItem: "Capstone",
          render: () => <Tab.Pane><Capstone /></Tab.Pane>
        }
      ]} />
    </Layout>
  )
}

export default SingleCoreComputing
