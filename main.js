// globals
// Make an instance of two.js and place it on the page.
const params = { fullscreen: true, autostart: true }
const body = document.body
const two = new Two(params).appendTo(body)
two.renderer.domElement.style.background = '#15104D'
two.bind('update', update)

// track the mouse position
const mouseVector = new Two.Vector(two.width / 2, two.height / 2)
window.addEventListener('mousemove', (event) => {
  mouseVector.x = event.clientX
  mouseVector.y = event.clientY
})

// utils
const range = (start, stop, step = 1) => Array.from(
  { length: (stop - start) / step + 1 },
  (_, index) => start + index * step
)

// a gradient between two colors
const gradientFn = (maxNr, startColor, endColor) => (stepNr) => {
  const formatHex = hex => hex.length === 1
    ? '0' + hex
    : hex

  const calcHex = (number, channelStartBase16, channelEndBase16) => {
    // colors in base 10
    const colorStart = parseInt(channelStartBase16, 16)
    const colorEnd = parseInt(channelEndBase16, 16)
    const colorPerUnit = (colorEnd - colorStart) / maxNr
    const colorStep = Math.round(colorPerUnit * number + colorStart)

    // convert to base 16 again
    return formatHex(colorStep.toString(16))
  }

  return calcHex(stepNr, startColor.substring(0, 2), endColor.substring(0, 2))
    + calcHex(stepNr, startColor.substring(2, 4), endColor.substring(2, 4))
    + calcHex(stepNr, startColor.substring(4, 6), endColor.substring(4, 6))
}

// a gradient between an array of given colors
const getGradientFn = (colors, nrOfSteps) => (step) => {
  if (step > nrOfSteps || step < 1) {
    throw new Error(`Supply a number between 1 and ${nrOfSteps}`)
  }

  // prepare the gradients
  const gradients = range(0, colors.length)
    .map(index => {
      // pick the current color and the next one
      const startColor = colors[index]
      const endColor = colors[index + 1]

      // create a gradient for it starting at 0 until the given nr. of steps
      return startColor && endColor
        ? gradientFn(nrOfSteps, startColor, endColor)
        : undefined
    })
    .filter(x => x)

  // determine which slice of the steps each gradient is responsible for
  const stepsPerGradient = Math.floor(nrOfSteps / gradients.length)
  const rangePerGradient = gradients.map((gradientFn, index) => {
    const offset = stepsPerGradient * index
    const range_ = range(1 + offset, stepsPerGradient + offset)

    return [range_, gradientFn]
  })

  // determine which gradient we should pick
  const [_, getColor] = rangePerGradient.find(([range_, _]) => {
    return range_.includes(step)
  })

  return '#' + getColor(step)
}

const config = {
  // the Embrace IT brand colors
  baseColors: [
    'e5d755', // green
    '6dc7dd', // blue
    'fff8dc', // white-ish
    // '673ab7',
    // '4caf50',
    // 'ff5722',
  ],
  nrOfSteps: 256,
}

function drawLine(start, end, color) {
  const line = two.makeLine(start.x, start.y, end.x, end.y)
  line.stroke = color

  return line
}

function update(frameCount, timeDelta) {
  // draw a line
  console.log(frameCount, timeDelta)
  const lineLength = 100

  const full_circle = (2 * Math.PI)
  const angle = (full_circle / 360) * frameCount
  const start = { x: mouseVector.x, y: mouseVector.y }
  const end = {
    x: (mouseVector.x + (lineLength * Math.cos(angle))),
    y: (mouseVector.y + (lineLength * Math.sin(angle)))
  }

  drawLine(start, end, 'orange')
}

// prepare the color getter
const getColorFromGradient = getGradientFn(config.baseColors, config.nrOfSteps)
