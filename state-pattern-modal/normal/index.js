class Modal {
  constructor() {
    this.oModal = document.getElementsByClassName('modal')[0]
    this.oBtnGroup = document.getElementsByClassName('btn-group')[0]

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
    this.oModal.className = `modal ${status}`
  }
}

new Modal()
