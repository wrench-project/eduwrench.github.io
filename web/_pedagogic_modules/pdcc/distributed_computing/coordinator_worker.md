---
layout: page
title: 'A.3.3 Coordinator-Worker'
order: 133
usemathjax: true
submodule: 'distributed_computing'
---

The goal of this module is to introduce you to the coordinator/worker model of 
computation, which in some sense extends client-server. 

Go through the following tabs in sequence...

<div class="ui pointing secondary menu">
  <a class="item " data-tab="basics">Basics</a>
  <a class="item " data-tab="scheduling">Scheduling Experiments</a>
</div>

<div markdown="1" class="ui tab segment active" data-tab="basics" >
  {% include_relative include_coordinator_worker/coordinator_worker_single.md %}
</div>
<div markdown="1" class="ui tab segment" data-tab="scheduling">
  {% include_relative include_coordinator_worker/coordinator_worker_multiple.md %}
</div>
