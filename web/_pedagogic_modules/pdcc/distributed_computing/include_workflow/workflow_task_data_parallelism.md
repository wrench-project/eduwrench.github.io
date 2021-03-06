
#### Learning Objectives
<div class="learningObjectiveBox" markdown="1">
  - Understand how task- and data-parallelism can be mixed
  - Be able to reason about the performance of programs that include both task- and data-parallelism
</div>
---

### Basic concept

So far in this module we have only considered sequential tasks. In other words, each task can only use
a single core.  But in the [Data-Parallelism tab  of the Multicore Computing module]({{site.baseurl}}/pedagogic_modules/pdcc/multi_core_computing/#/data-parallelism), we 
learned about **Data Parallelism**: the notion that a sequential task can be rewritten as a set of
parallel tasks, with perhaps a remaining sequential portion of the execution. Then, in that same tab,
we learned about **Amdahl's Law**, which quantifies the data-parallel task's execution time on a given
number of cores, given what fraction of the task's work has to remain sequential. You may want to 
review this content before proceeding. 

*Let's consider workflows in which  some tasks are data-parallel*. For these tasks we need to decide
how many cores they should use. So our workflow has both task-parallelism (like all workflows) and
data-parallelism. This is often called "mixed" parallelism. 

### An example

<object class="figure" type="image/svg+xml" data="{{ site.baseurl }}/public/img/workflows/workflow_task_data_parallelism_workflow.svg">Example workflow with task- and data-parallelism.</object>
<div class="caption"><strong>Figure 1:</strong> A simple workflow with some data-parallel tasks ($\alpha$ is the fraction of the work that is non-parallelizable)</div>

Figure 1 above shows an example workflow with both task- and data-parallelism. For simplicity, we completely ignore
files and I/O.  The green and red tasks are not data-parallel, and can run only on a single core.  The blue, yellow, and
purple tasks are data-parallel. For each one of these tasks, in addition to its amount of work, we also indicate the value of $\alpha$,
the fraction of the work that can be parallelized. Based on Amdahl's law, a data-parallel task with
work $w$ Gflop runs on a $p$-core computer, where core speed is $s$ Gflop/sec, in time:

$$
T(p) = \frac{\alpha \times \frac{w}{s}}{p} + (1 - \alpha) \times \frac{w}{s}
$$

The above equation just means that the parallelizable portion of the sequential execution time (the left term) is accelerated
by a factor $p$ when executed in parallel on $p$ cores, while the sequential portion (the right term) remains sequential. 

Say we are running this workflow on a 4-core computer where cores compute at speed 100 Gflop/sec. 
We could run each of the data-parallel tasks using 4 cores. In this case, here is the execution time of each task:
 
  - Green: $1.00$ sec
  - Blue: $10 \times 0.9 / 4 + 10 \times 0.1 = 3.25$ sec
  - Yellow: $20 \times 0.85 / 4 + 20 \times 0.15 = 7.25$ sec
  - Purple: $12 \times 0.80 / 4 + 12 \times 0.20 = 4.80$ sec
  - Red: $1.00$ sec

No two tasks can run at the same time. So the total execution time is the sum of the task execution times, i.e., 17.30 seconds. 

There are many other options! For instance, we could run the blue task using 2 cores, the yellow task using 2 cores,
and the purple task using 4 cores, for the following task execution times:

  - Green: $1.00$ sec
  - Blue: $10 \times 0.9 / 2 + 10 \times 0.1 =$  5.50 sec
  - Yellow: $20 \times 0.85 / 2 + 20 \times 0.15 =$  11.5 sec
  - Purple: $12 \times 0.80 / 4 + 12 \times 0.20 =$ 4.80 sec
  - Red: $1.00$ sec

But now the blue and yellow tasks can run simultaneously! So the execution time is:
$1 + 11.5 + 4.80 + 1 = $ 18.30 seconds.   This option is not as good as the previous one. 

How many options are there? Well, for each of the 3 tasks we have 4 options, so that is $4^3 = 64$ options!!! One 
(or more) of these options has to be the best one, and one (or more) has to be the worst one. 
For instance, running all tasks on a single core would waste 1 core of our 4-core computer, and 
is clearly not as good as running some of the tasks on 2 cores. 


#### Simulating Task- and Data-Parallelism

The simulation app below makes it possible to simulate the execution of the
above example workflow on a platform that comprises **two 3-core hosts**.
Again, remember that in this tab we ignore all I/O. The app allows you to
pick how many cores are used for the blue, yellow, and purple tasks. The
execution strategy, when picking tasks to assign to idle cores, always
picks tasks in the order yellow, blue, purple. But turns out this does not
matter in terms of application performance  (because we have only 3 tasks
to run on the 2 compute hosts).  You can use this app on your own, but then
you should use it to answer the following practice questions.

{% include simulator.html src="workflow_task_data_parallelism" %}

---

#### Practice Questions

**[A.3.4.p4.1]** Estimate the execution time when all data-parallel tasks use 3 cores. Show your work, and double-check your answer in simulation.

<div class="ui accordion fluid">
  <div class=" title">
    <i class="dropdown icon"></i>
    (click to see answer)
  </div>
  <div markdown="1" class="ui segment content answer-frame">
With 3 cores, here are the data-parallel task execution times: 

  - Blue task: $0.90 \times 10 / 3 + 0.10  \times 10 =$ 4.00 seconds
  - Yellow task: $0.85 \times 20 / 3 + 0.15  \times 20 =$ 8.66 seconds
  - Purple task: $0.80 \times 12 / 3 + 0.20  \times 12 =$ 5.60 seconds
  
The blue and purple tasks run on the same host, for a total time of 9.60 seconds,
while the yellow task runs on  the other host.

The total execution time is thus 11.60 seconds, which is confirmed by the simulation. 
 
  </div>
</div>
<p></p>

**[A.3.4.p4.2]** Say that you must configure two of the data-parallel tasks to use 
1 core, and the third one to use 3 cores.  Which task should use 3 cores to achieve
the shortest execution time?  Come up with an answer based on reasoning (i.e., without
computing anything),  and then
check your intuition in simulation. 

<div class="ui accordion fluid">
  <div class=" title">
    <i class="dropdown icon"></i>
    (click to see answer)
  </div>
  <div markdown="1" class="ui segment content answer-frame">

The yellow task has 2000 Gflop work, so, even though its $\alpha$ is not as high as
that of the blue task, we should give it the  3 cores!

The simulation gives us the following total execution times:

  - when giving  3 cores to the blue task: 22  seconds
  - when giving 3 cores to the yellow task:  14 seconds
  - when giving 3 cores to the purple task: 22 seconds
  
Our intuition is confirmed. The fact that the other two options have the same
execution time  is simply because the yellow task is the task that determines
the execution time. 
 
  </div>
</div>
<p></p>


**[A.3.4.p4.3]** Say we configure each data-parallel to run on 2 cores. Which of these tasks 
will run on the same host? Come up with an answer using either reasoning (i.e., don't compute anything), and then double-check
it in simulation.

<div class="ui accordion fluid">
  <div class=" title">
    <i class="dropdown icon"></i>
    (click to see answer)
  </div>
  <div markdown="1" class="ui segment content answer-frame">

When using 2 cores, the yellow task will still be the longest task, so it will be
placed by itself on a host. The blue and purple task will run on the same host.   This is 
confirmed in the simulation output. 

  </div>
</div>
<p></p>

**[A.3.4.p4.4]** Because the yellow task is so expensive,  we decide to always  run
it on 3 cores. Is it better to give 1 core to the blue task and 2 cores to the
purple task, or the other way around? Show your work/reasoning.

<div class="ui accordion fluid">
  <div class=" title">
    <i class="dropdown icon"></i>
    (click to see answer)
  </div>
  <div markdown="1" class="ui segment content answer-frame">

All data-parallel tasks run simultaneously.

First, does this matter? That is, if the yellow task runs for, say 13 seconds, it
does not really matter what we do with the blue and purple tasks. Turns out that
the yellow task runs in time $20 \times 0.85 / 3 + 20 \times 0.15 =$ 8.66 seconds.
So the yellow task will not determine the execution time, and yes, the choice in the question matters. 

If we give 1 core to the blue task, then it runs in 10 seconds, and determines the
execution time. If instead
we give 1 core to the purple task, it will run in 12 seconds, and determines the
execution time. So we should give 2 cores to the purple task and 1 core to the
blue task. 

  </div>
</div>
<p></p>

---

#### Questions

Considering the workflow below, answer the following questions. 

<object class="figure" type="image/svg+xml" data="{{ site.baseurl }}/public/img/workflows/workflow_task_data_parallelism_workflow_question.svg">Workflow for question.</object>

**[A.3.4.q4.1]** If we are given two hosts with 100 Gflop/sec hosts, where
host1 has 20 cores and host2 has 40 cores. Should we run the blue task on
host1 or on host2 (if our objective is to run the workflow as quickly as
possible)?  Show your work, execution each task execution time on each host.

**[A.3.4.q4.2]** If, instead, we run the workflow on a single 4-core computer,
what is the best approach? Show your work, estimating the execution times of each task
on 1, 2, 3, and 4 cores, and considering all ways to assign cores to each task. 

**[A.3.4.q4.3]** Say now we are running our workflow on a single 40-core
host. What is the best way to allocate cores to the blue and purple tasks? If
you are really into it, you can do this completely analytically (it requires
finding roots of degree-2 polynomials).  More easily, you can simply
write the execution time as a function of the number of cores allocated
to the blue task, and plot this function to find where it attains 
its minimum visually.  There are many websites on which you can do this
(search for "graphing calculator"). Show your work.

---
