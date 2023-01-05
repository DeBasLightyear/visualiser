function drawLine(start, end, color) {
  const line = two.makeLine(start.x, start.y, end.x, end.y)
  line.stroke = color

  return line
}

// Make an instance of two and place it on the page.
const params = { fullscreen: true }
const body = document.body
const two = new Two(params).appendTo(body)
two.renderer.domElement.style.background = '#15104D'

// track the mouse position
window.addEventListener('mousemove', function (event) {
  const start = { x: event.clientX, y: event.clientY }
  const end = { x: event.clientX + 100, y: event.clientY + 100 }
  drawLine(start, end, 'orange')

  two.update()
})
