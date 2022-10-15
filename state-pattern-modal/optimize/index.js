// const state = {
//   SUCCESS: 'success',
//   WARNING: 'warning',
//   ERROR: 'error'
// }

// class SuccessState {
//   status = state.SUCCESS
//   className = 'modal success'
//   title = 'Modal - success'
// }

// class WarningState {
//   status = state.WARNING
//   className = 'modal warning'
//   title = 'Modal - warning'
// }

// class ErrorState {
//   status = state.ERROR
//   className = 'modal error'
//   title = 'Modal - error'
// }

// class StateFactory {
//   static create(status) {
//     switch (status) {
//       case state.SUCCESS:
//         return new SuccessState()
//       case state.WARNING:
//         return new WarningState()
//       case state.ERROR:
//         return new ErrorState()
//     }
//   }
// }

const FSM = {
  success: {
    className: 'modal success',
    title: 'Modal - success'
  },
  warning: {
    className: 'modal warning',
    title: 'Modal - warning'
  },
  error: {
    className: 'modal error',
    title: 'Modal - error'
  }
}

class Modal {
  constructor() {
    this.oModal = document.getElementsByClassName('modal')[0]
    this.oBtnGroup = document.getElementsByClassName('btn-group')[0]
    this.oModalHeader = this.oModal.children[0]

    this.init()
  }

  init() {
    this.bindEvent()
  }

  bindEvent() {
    this.oBtnGroup.addEventListener('click', this.handleBtnClick.bind(this), false)
  }

  handleBtnClick(ev) {
    const e = ev || window.event,
      target = e.target || e.srcElement,
      tagName = target.tagName.toLowerCase()

    if (tagName === 'button') {
      const status = target.dataset.status

      this.changeState.call(this, status)
    }
  }

  changeState(status) {
    // const { className, title } = StateFactory.create(status)
    const { className, title } = FSM[status]

    this.oModal.className = className
    this.oModalHeader.innerHTML = title
  }
}

new Modal()
