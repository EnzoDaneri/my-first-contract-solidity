App = {

    contracts: {}, 
    init: async () => {
        console.log('loaded');
    await App.loadEthereum();
    await App.loadAccount();
    await App.loadContracts();
          App.render();
    await App.renderTasks();
    },

    loadEthereum: async() => {
        if (window.ethereum) {
            console.log('ethereum existe');
            App.web3Provider = window.ethereum
            await window.ethereum.request({ method: 'eth_requestAccounts' })
        } else {
            console.log('No ethereum broswser is installed...');
        }
    },

    loadAccount: async() => {
     
       const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
       App.account = accounts[0]
    },

    loadContracts: async () => {
        const res = await fetch('TasksContract.json')
        const tasksContractJson = await res.json()

        App.contracts.tasksContract = TruffleContract(tasksContractJson)

        App.contracts.tasksContract.setProvider( App.web3Provider)

        App.tasksContract = await App.contracts.tasksContract.deployed()

    },

    render: () => {

        document.getElementById('account').innerText = App.account
    },

    renderTasks: async () => {
     const taskCounter = await App.tasksContract.taskCounter()
     const taskCounterNumber = taskCounter.toNumber()
     console.log(taskCounterNumber);


     let html = ''

     for(let i = 1; i <= taskCounterNumber; i++) {
       const task = await App.tasksContract.tasks(i)
       const taskId = task[0]
       const taskTitle = task[1]
       const taskDescription = task[2]
       const taskDone = task[3]
       const taskCreated = task[4]

      let taskElement = `
      <div class='card bg-dark rounded-0 mb-2'>
         <div class='card-header d-flex justify-content-between align-items-center'>
           <span> ${taskTitle}</span>
           
           <div class='form-check form-switch'>
             <input onchange='App.toggleDone(this)' data-id="${taskId}" class='form-check-input' type='checkbox' ${taskDone && "checked"}/>
           </div>

         </div>
     <div>

     <div class='card-body'>
      
     <span> ${taskDescription}</span>
     <p class='text-muted'>Task was created ${new Date(taskCreated * 1000).toLocaleString()}</p>
     
     </div>

         </div>
      </div>
      `
      html += taskElement;

     }

     document.getElementById('taskList').innerHTML = html;

    },

    createTask: async (title,description) => {
     const result = await App.tasksContract.createTask(title, description, {from: App.account})
     console.log(result.logs[0].args);
    },

    toggleDone: async(element) => {
     const taskId = element.dataset.id;

    await App.tasksContract.toggleDone(taskId, {
        from: App.account
    });

    window.location.reload()
    }

    
    
}

