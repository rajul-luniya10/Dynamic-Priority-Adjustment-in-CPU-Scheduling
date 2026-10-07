/* =========================================================
   DYNAMIC PRIORITY CPU SCHEDULER
========================================================= */


/* =========================================================
   SETTINGS
========================================================= */

/*
   One CPU time unit takes 900 milliseconds.

   Example:

   10 CPU units ≈ 9 seconds
   20 CPU units ≈ 18 seconds
   30 CPU units ≈ 27 seconds
*/

const SIMULATION_SPEED = 900;


/*
   Every 2 units of waiting time,
   priority increases by 1.
*/

const AGING_INTERVAL = 2;



/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let processes = [];

let processCounter = 0;

let simulationRunning = false;

let ganttBlocks = [];



/* =========================================================
   DOM ELEMENTS
========================================================= */

const arrivalInput =
    document.getElementById("arrivalTime");

const burstInput =
    document.getElementById("burstTime");

const priorityInput =
    document.getElementById("priority");

const addProcessBtn =
    document.getElementById("addProcessBtn");

const normalBtn =
    document.getElementById("normalBtn");

const dynamicBtn =
    document.getElementById("dynamicBtn");

const resetBtn =
    document.getElementById("resetBtn");

const processTableBody =
    document.getElementById("processTableBody");

const processCount =
    document.getElementById("processCount");

const simulationSection =
    document.getElementById("simulationSection");

const resultsSection =
    document.getElementById("resultsSection");

const simulationMethod =
    document.getElementById("simulationMethod");

const resultMethod =
    document.getElementById("resultMethod");

const currentTimeDisplay =
    document.getElementById("currentTime");

const runningProcessDisplay =
    document.getElementById("runningProcess");

const completedCountDisplay =
    document.getElementById("completedCount");

const cpuStatus =
    document.getElementById("cpuStatus");

const ganttContainer =
    document.getElementById("ganttContainer");

const livePriorityContainer =
    document.getElementById("livePriorityContainer");

const simulationLog =
    document.getElementById("simulationLog");

const liveExplanation =
    document.getElementById("liveExplanation");

const resultsTableBody =
    document.getElementById("resultsTableBody");



/* =========================================================
   ADD PROCESS
========================================================= */

addProcessBtn.addEventListener(
    "click",
    addProcess
);


function addProcess() {

    if (simulationRunning) {

        alert(
            "Please wait for the simulation to finish."
        );

        return;
    }


    const arrivalTime =
        Number(arrivalInput.value);

    const burstTime =
        Number(burstInput.value);

    const priority =
        Number(priorityInput.value);



    /* ---------- VALIDATION ---------- */

    if (
        arrivalInput.value === "" ||
        burstInput.value === "" ||
        priorityInput.value === ""
    ) {

        alert(
            "Please enter Arrival Time, Burst Time and Priority."
        );

        return;
    }


    if (arrivalTime < 0) {

        alert(
            "Arrival Time cannot be negative."
        );

        return;
    }


    if (burstTime <= 0) {

        alert(
            "Burst Time must be greater than 0."
        );

        return;
    }


    if (priority <= 0) {

        alert(
            "Priority must be greater than 0."
        );

        return;
    }



    /* ---------- CREATE PROCESS ---------- */

    processCounter++;


    const process = {

        id:
            `P${processCounter}`,

        arrivalTime:
            arrivalTime,

        burstTime:
            burstTime,

        priority:
            priority

    };


    processes.push(process);



    /* ---------- UPDATE ---------- */

    renderProcessTable();

    clearInputs();

    arrivalInput.focus();

}



/* =========================================================
   CLEAR INPUTS
========================================================= */

function clearInputs() {

    arrivalInput.value = "";

    burstInput.value = "";

    priorityInput.value = "";

}



/* =========================================================
   PROCESS TABLE
========================================================= */

function renderProcessTable() {

    processCount.textContent =
        processes.length;


    if (processes.length === 0) {

        processTableBody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="empty-row"
                >

                    <div class="empty-icon">
                        +
                    </div>

                    <strong>
                        No processes yet
                    </strong>

                    <span>
                        Add your first process above
                    </span>

                </td>

            </tr>

        `;

        return;
    }


    processTableBody.innerHTML = "";


    processes.forEach(
        (process, index) => {

            const row =
                document.createElement("tr");


            row.classList.add("fade-in");


            row.innerHTML = `

                <td>

                    <span class="process-id">
                        ${process.id}
                    </span>

                </td>


                <td>
                    ${process.arrivalTime}
                </td>


                <td>
                    ${process.burstTime}
                </td>


                <td>

                    <span class="priority-value">
                        ${process.priority}
                    </span>

                </td>


                <td>

                    <button
                        class="remove-btn"
                        onclick="removeProcess(${index})"
                    >
                        Remove
                    </button>

                </td>

            `;


            processTableBody.appendChild(row);

        }
    );

}



/* =========================================================
   REMOVE PROCESS
========================================================= */

function removeProcess(index) {

    if (simulationRunning) {
        return;
    }


    processes.splice(
        index,
        1
    );


    renderProcessTable();

}



/* =========================================================
   BUTTONS
========================================================= */

normalBtn.addEventListener(
    "click",
    () => runScheduler("normal")
);


dynamicBtn.addEventListener(
    "click",
    () => runScheduler("dynamic")
);



/* =========================================================
   MAIN SCHEDULER
========================================================= */

async function runScheduler(mode) {

    if (processes.length === 0) {

        alert(
            "Please add at least one process first."
        );

        return;
    }


    if (simulationRunning) {
        return;
    }


    simulationRunning = true;


    /* Show simulation */

    simulationSection.classList.remove(
        "hidden"
    );


    resultsSection.classList.add(
        "hidden"
    );


    simulationSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });


    resetSimulationUI();



    /* ---------- COPY PROCESSES ---------- */

    const simulationProcesses =
        processes.map(process => ({

            id:
                process.id,

            arrivalTime:
                process.arrivalTime,

            burstTime:
                process.burstTime,

            priority:
                process.priority,

            currentPriority:
                process.priority,

            remainingTime:
                process.burstTime,

            waitingTime:
                0,

            firstStartTime:
                null,

            completionTime:
                null,

            turnaroundTime:
                null,

            responseTime:
                null,

            finished:
                false

        }));



    /* ---------- METHOD ---------- */

    if (mode === "normal") {

        simulationMethod.textContent =
            "NORMAL PRIORITY";

        resultMethod.textContent =
            "NORMAL PRIORITY";


        addLog(
            "SYSTEM",
            "Normal Priority Scheduling has started."
        );


        updateExplanation(
            "The CPU will always select the available process with the highest fixed priority."
        );


    } else {

        simulationMethod.textContent =
            "DYNAMIC PRIORITY";

        resultMethod.textContent =
            "DYNAMIC PRIORITY";


        addLog(
            "SYSTEM",
            "Dynamic Priority Scheduling has started."
        );


        addLog(
            "AGING",
            `Every ${AGING_INTERVAL} waiting time units can increase a process priority by 1.`
        );


        updateExplanation(
            "The scheduler will increase the priority of processes that wait too long."
        );

    }



    /* ---------- RUN ---------- */

    const result =
        await simulateScheduling(
            simulationProcesses,
            mode
        );



    /* ---------- RESULTS ---------- */

    displayResults(
        result.processes
    );


    simulationRunning = false;

}



/* =========================================================
   SIMULATION ENGINE
========================================================= */

async function simulateScheduling(
    simProcesses,
    mode
) {

    let currentTime = 0;

    let completed = 0;

    let previousProcess = null;


    /* Sort by arrival time */

    simProcesses.sort(
        (a, b) =>
            a.arrivalTime -
            b.arrivalTime
    );


    const totalProcesses =
        simProcesses.length;



    /* =====================================================
       MAIN LOOP
    ===================================================== */

    while (
        completed <
        totalProcesses
    ) {


        /* ================================================
           FIND AVAILABLE PROCESSES
        ================================================ */

        const available =
            simProcesses.filter(
                process =>

                    process.arrivalTime <=
                    currentTime &&

                    !process.finished &&

                    process.remainingTime > 0
            );



        /* ================================================
           CPU IDLE
        ================================================ */

        if (
            available.length === 0
        ) {

            currentTimeDisplay.textContent =
                currentTime;


            runningProcessDisplay.textContent =
                "IDLE";


            cpuStatus.textContent =
                "CPU is waiting";


            updateExplanation(
                "No process has arrived yet, so the CPU is idle."
            );


            addGanttBlock(
                "IDLE",
                currentTime,
                currentTime + 1,
                true
            );


            await sleep(
                SIMULATION_SPEED
            );


            currentTime++;

            continue;

        }



        /* ================================================
           UPDATE WAITING PROCESSES
        ================================================ */

        available.forEach(
            process => {

                if (
                    process.id !==
                    previousProcess
                ) {

                    process.waitingTime++;

                }

            }
        );



        /* ================================================
           DYNAMIC AGING
        ================================================ */

        if (
            mode === "dynamic"
        ) {

            available.forEach(
                process => {

                    if (
                        process.id ===
                        previousProcess
                    ) {
                        return;
                    }


                    const newPriority =
                        process.priority +
                        Math.floor(
                            process.waitingTime /
                            AGING_INTERVAL
                        );


                    if (
                        newPriority >
                        process.currentPriority
                    ) {

                        const oldPriority =
                            process.currentPriority;


                        process.currentPriority =
                            newPriority;


                        addLog(
                            `T${currentTime}`,
                            `${process.id} priority increased from ${oldPriority} to ${newPriority}.`
                        );


                        updateExplanation(

                            `${process.id} has been waiting for ${process.waitingTime} time units, so its priority increased from ${oldPriority} to ${newPriority}.`

                        );

                    }

                }
            );

        }



        /* ================================================
           SELECT PROCESS
        ================================================ */

        available.sort(
            (a, b) => {

                const priorityA =
                    mode === "dynamic"
                        ? a.currentPriority
                        : a.priority;


                const priorityB =
                    mode === "dynamic"
                        ? b.currentPriority
                        : b.priority;


                /* Higher priority first */

                if (
                    priorityA !==
                    priorityB
                ) {

                    return (
                        priorityB -
                        priorityA
                    );

                }


                /* Earlier arrival first */

                if (
                    a.arrivalTime !==
                    b.arrivalTime
                ) {

                    return (
                        a.arrivalTime -
                        b.arrivalTime
                    );

                }


                /* Smaller process ID first */

                return (
                    getProcessNumber(a.id) -
                    getProcessNumber(b.id)
                );

            }
        );



        const selectedProcess =
            available[0];



        /* ================================================
           PROCESS START
        ================================================ */

        if (
            selectedProcess.firstStartTime ===
            null
        ) {

            selectedProcess.firstStartTime =
                currentTime;


            selectedProcess.responseTime =
                currentTime -
                selectedProcess.arrivalTime;


            addLog(
                `T${currentTime}`,
                `${selectedProcess.id} started running on the CPU.`
            );


        }



        /* ================================================
           DISPLAY CURRENT STATE
        ================================================ */

        currentTimeDisplay.textContent =
            currentTime;


        runningProcessDisplay.textContent =
            selectedProcess.id;


        cpuStatus.textContent =
            `${selectedProcess.id} is running`;


        updateExplanation(

            `${selectedProcess.id} has the highest current priority, so the CPU is executing it.`

        );



        /* ================================================
           GANTT
        ================================================ */

        addGanttBlock(
            selectedProcess.id,
            currentTime,
            currentTime + 1,
            false
        );



        /* ================================================
           LIVE PRIORITIES
        ================================================ */

        renderLivePriorities(
            simProcesses,
            selectedProcess.id,
            mode
        );



        /* ================================================
           EXECUTE ONE TIME UNIT
        ================================================ */

        selectedProcess.remainingTime--;



        /* ================================================
           SHOW CURRENT TIME FOR A WHILE
        ================================================ */

        await sleep(
            SIMULATION_SPEED
        );


        currentTime++;



        /* ================================================
           COMPLETION
        ================================================ */

        if (
            selectedProcess.remainingTime ===
            0
        ) {

            selectedProcess.finished =
                true;


            selectedProcess.completionTime =
                currentTime;


            selectedProcess.turnaroundTime =
                selectedProcess.completionTime -
                selectedProcess.arrivalTime;


            selectedProcess.waitingTime =
                selectedProcess.turnaroundTime -
                selectedProcess.burstTime;


            completed++;


            addLog(
                `T${currentTime}`,
                `${selectedProcess.id} completed execution.`
            );


            updateExplanation(

                `${selectedProcess.id} has finished. Completion Time = ${currentTime}.`

            );

        }



        previousProcess =
            selectedProcess.id;


        completedCountDisplay.textContent =
            `${completed} / ${totalProcesses}`;

    }



    /* =====================================================
       FINISHED
    ===================================================== */

    currentTimeDisplay.textContent =
        currentTime;


    runningProcessDisplay.textContent =
        "FINISHED";


    cpuStatus.textContent =
        "Simulation completed";


    updateExplanation(

        "All processes have finished. Scroll down to see the final scheduling results."

    );


    addLog(
        "SYSTEM",
        "Simulation completed successfully."
    );


    renderLivePriorities(
        simProcesses,
        null,
        mode
    );


    return {

        processes:
            simProcesses

    };

}



/* =========================================================
   GANTT CHART
========================================================= */

function addGanttBlock(
    processId,
    start,
    end,
    idle
) {

    const last =
        ganttBlocks[
            ganttBlocks.length - 1
        ];


    /*
       If the same process continues running,
       extend its existing block.
    */

    if (
        last &&
        last.processId === processId &&
        last.end === start
    ) {

        last.end = end;

    } else {

        ganttBlocks.push({

            processId:
                processId,

            start:
                start,

            end:
                end,

            idle:
                idle

        });

    }


    renderGantt();

}



/* =========================================================
   RENDER GANTT
========================================================= */

function renderGantt() {

    if (
        ganttBlocks.length === 0
    ) {

        ganttContainer.innerHTML = `

            <div class="gantt-empty">
                Simulation has not started yet.
            </div>

        `;

        return;
    }


    const track =
        document.createElement("div");

    track.className =
        "gantt-track";



    ganttBlocks.forEach(
        block => {

            const duration =
                block.end -
                block.start;


            const element =
                document.createElement("div");


            element.className =
                "gantt-block";


            if (block.idle) {

                element.classList.add(
                    "idle"
                );

            }


            element.style.width =
                `${Math.max(
                    duration * 75,
                    75
                )}px`;


            element.textContent =
                block.processId;


            track.appendChild(
                element
            );

        }
    );



    const times =
        document.createElement("div");

    times.className =
        "gantt-times";



    ganttBlocks.forEach(
        block => {

            const time =
                document.createElement("div");


            time.className =
                "gantt-time";


            time.style.width =
                `${Math.max(
                    (block.end - block.start) * 75,
                    75
                )}px`;


            time.textContent =
                block.start;


            times.appendChild(
                time
            );

        }
    );



    /* Final time */

    const lastBlock =
        ganttBlocks[
            ganttBlocks.length - 1
        ];


    const finalTime =
        document.createElement("div");


    finalTime.className =
        "gantt-time";


    finalTime.textContent =
        lastBlock.end;


    times.appendChild(
        finalTime
    );



    ganttContainer.innerHTML = "";


    ganttContainer.appendChild(
        track
    );


    ganttContainer.appendChild(
        times
    );

}



/* =========================================================
   LIVE PROCESS STATUS
========================================================= */

function renderLivePriorities(
    simProcesses,
    runningId,
    mode
) {

    livePriorityContainer.innerHTML = "";


    simProcesses.forEach(
        process => {

            const card =
                document.createElement("div");


            card.className =
                "priority-card";


            if (
                process.id ===
                runningId
            ) {

                card.classList.add(
                    "running"
                );

            }


            if (
                process.finished
            ) {

                card.classList.add(
                    "completed"
                );

            }


            const priority =
                mode === "dynamic"
                    ? process.currentPriority
                    : process.priority;


            let status =
                "Waiting";


            if (
                process.finished
            ) {

                status =
                    "Completed";

            } else if (
                process.id === runningId
            ) {

                status =
                    "Running";

            } else if (
                process.arrivalTime >
                Number(
                    currentTimeDisplay.textContent
                )
            ) {

                status =
                    "Not arrived";

            }



            card.innerHTML = `

                <div class="priority-top">

                    <span class="priority-process">
                        ${process.id}
                    </span>

                    <span class="priority-number">
                        ${priority}
                    </span>

                </div>


                <div class="priority-status">
                    ${status}
                </div>


                <div class="priority-details">

                    <span>
                        Waiting:
                        ${Math.max(
                            0,
                            process.waitingTime
                        )}
                    </span>

                    <span>
                        Remaining:
                        ${process.remainingTime}
                    </span>

                </div>

            `;


            livePriorityContainer.appendChild(
                card
            );

        }
    );

}



/* =========================================================
   EXPLANATION
========================================================= */

function updateExplanation(
    message
) {

    liveExplanation.innerHTML = `

        <span class="explanation-icon">
            ▶
        </span>

        <p>
            ${message}
        </p>

    `;

}



/* =========================================================
   LOG
========================================================= */

function addLog(
    time,
    message
) {

    const item =
        document.createElement("div");


    item.className =
        "log-item fade-in";


    item.innerHTML = `

        <span class="log-time">
            ${time}
        </span>

        <span>
            ${message}
        </span>

    `;


    simulationLog.appendChild(
        item
    );


    simulationLog.scrollTop =
        simulationLog.scrollHeight;

}



/* =========================================================
   RESULTS
========================================================= */

function displayResults(
    simProcesses
) {

    resultsSection.classList.remove(
        "hidden"
    );


    resultsTableBody.innerHTML = "";


    const sorted =
        [...simProcesses].sort(
            (a, b) =>
                getProcessNumber(a.id) -
                getProcessNumber(b.id)
        );


    let totalCT = 0;

    let totalTAT = 0;

    let totalWT = 0;

    let totalRT = 0;



    sorted.forEach(
        process => {

            totalCT +=
                process.completionTime;


            totalTAT +=
                process.turnaroundTime;


            totalWT +=
                process.waitingTime;


            totalRT +=
                process.responseTime;



            const row =
                document.createElement("tr");


            row.classList.add(
                "fade-in"
            );


            row.innerHTML = `

                <td>

                    <span class="process-id">
                        ${process.id}
                    </span>

                </td>


                <td>
                    ${process.arrivalTime}
                </td>


                <td>
                    ${process.burstTime}
                </td>


                <td>

                    <span class="priority-value">
                        ${process.priority}
                    </span>

                </td>


                <td>

                    <span class="result-highlight">
                        ${process.completionTime}
                    </span>

                </td>


                <td>
                    ${process.turnaroundTime}
                </td>


                <td>
                    ${process.waitingTime}
                </td>


                <td>
                    ${process.responseTime}
                </td>

            `;


            resultsTableBody.appendChild(
                row
            );

        }
    );



    const count =
        sorted.length;



    document.getElementById(
        "avgCT"
    ).textContent =
        (
            totalCT /
            count
        ).toFixed(2);



    document.getElementById(
        "avgTAT"
    ).textContent =
        (
            totalTAT /
            count
        ).toFixed(2);



    document.getElementById(
        "avgWT"
    ).textContent =
        (
            totalWT /
            count
        ).toFixed(2);



    document.getElementById(
        "avgRT"
    ).textContent =
        (
            totalRT /
            count
        ).toFixed(2);



    setTimeout(
        () => {

            resultsSection.scrollIntoView({

                behavior: "smooth",

                block: "start"

            });

        },
        600
    );

}



/* =========================================================
   RESET SIMULATION UI
========================================================= */

function resetSimulationUI() {

    ganttBlocks = [];


    currentTimeDisplay.textContent =
        "0";


    runningProcessDisplay.textContent =
        "-";


    completedCountDisplay.textContent =
        `0 / ${processes.length}`;


    cpuStatus.textContent =
        "Preparing...";


    simulationMethod.textContent =
        "-";


    resultMethod.textContent =
        "-";


    ganttContainer.innerHTML = `

        <div class="gantt-empty">
            Preparing simulation...
        </div>

    `;


    livePriorityContainer.innerHTML = "";


    liveExplanation.innerHTML = `

        <span class="explanation-icon">
            ▶
        </span>

        <p>
            Preparing the scheduler...
        </p>

    `;


    simulationLog.innerHTML = `

        <div class="log-item">

            <span class="log-time">
                SYSTEM
            </span>

            <span>
                Preparing simulation...
            </span>

        </div>

    `;


    resultsTableBody.innerHTML = "";


    document.getElementById(
        "avgCT"
    ).textContent =
        "0.00";


    document.getElementById(
        "avgTAT"
    ).textContent =
        "0.00";


    document.getElementById(
        "avgWT"
    ).textContent =
        "0.00";


    document.getElementById(
        "avgRT"
    ).textContent =
        "0.00";

}



/* =========================================================
   RESET EVERYTHING
========================================================= */

resetBtn.addEventListener(
    "click",
    resetEverything
);


function resetEverything() {

    if (simulationRunning) {

        alert(
            "Please wait until the current simulation finishes."
        );

        return;
    }


    processes = [];

    processCounter = 0;


    renderProcessTable();


    simulationSection.classList.add(
        "hidden"
    );


    resultsSection.classList.add(
        "hidden"
    );


    resetSimulationUI();


    clearInputs();


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}



/* =========================================================
   ENTER KEY
========================================================= */

[
    arrivalInput,
    burstInput,
    priorityInput

].forEach(
    input => {

        input.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    addProcess();

                }

            }
        );

    }
);



/* =========================================================
   PROCESS NUMBER
========================================================= */

function getProcessNumber(
    id
) {

    return Number(
        id.replace(
            "P",
            ""
        )
    );

}



/* =========================================================
   DELAY
========================================================= */

function sleep(
    milliseconds
) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                milliseconds
            )
    );

}



/* =========================================================
   INITIALIZE
========================================================= */

renderProcessTable();