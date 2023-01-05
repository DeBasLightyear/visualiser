// GLOBALS
// Make an instance of two.js and place it on the page.
const config = {
  baseColors: [ // the Embrace IT brand colors
    'e5d755',   // green
    '6dc7dd',   // blue
    'fff8dc',   // white-ish
  ],
  nrOfSteps: 256,
}

const two = new Two({
  fullscreen: true,
  autostart: true,
}).appendTo(document.body)

two.renderer.domElement.style.background = '#1e1f1e'
two.bind('update', update)

// track the mouse position
const mouseVector = new Two.Vector(two.width / 2, two.height / 2)
window.addEventListener('mousemove', (event) => {
  mouseVector.x = event.clientX
  mouseVector.y = event.clientY
})

// pause/resume when pressing space
window.addEventListener('keydown', event => {
  if (event.code === 'Space') {
    if (two.playing) {
      two.pause()
    } else {
      two.play()
    }
  }
})

// utils
const range = (start, stop, step = 1) => Array.from(
  { length: (stop - start) / step + 1 },
  (_, index) => start + index * step
)

class EternalIterator {
  constructor(length) {
    this.index = 0
    this.length = length
  }

  next() {
    const currentValue = this.index

    if (currentValue === this.length - 1) {
      this.index = 0
    } else {
      this.index++
    }

    return currentValue
  }
}

const eternalIterator = new EternalIterator(config.nrOfSteps)

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
  // kept running into missed by 1 errors, used hacky fix
  const normalisedStep = step > nrOfSteps
    ? nrOfSteps
    : step

  // prepare the gradients
  const gradientFns = range(0, colors.length)
    .map(index => {
      // pick the current color and the next one
      const startColor = colors[index]
      const endColor = colors[index + 1]

      // loop the gradient back to the first color when we're at the end of 
      // the color array
      if (startColor && !endColor) {
        return gradientFn(nrOfSteps, startColor, colors[0])
      }

      // create a gradient for it starting at 0 until the given nr. of steps
      return startColor && endColor
        ? gradientFn(nrOfSteps, startColor, endColor)
        : undefined
    })
    .filter(x => x)

  // determine which slice of the steps each gradient is responsible for
  const stepsPerGradient = Math.floor(nrOfSteps / gradientFns.length)
  const rangePerGradient = gradientFns.map((fn, index) => {
    const offset = stepsPerGradient * index
    const range_ = range(1 + offset, stepsPerGradient + offset)

    return [range_, fn]
  })

  // determine which gradient we should pick
  const [_, getColor] = rangePerGradient.find(([range_, _]) => {
    return range_.includes(normalisedStep)
  })

  return '#' + getColor(normalisedStep)
}

// prepare the color getter
const getColorFromGradient = getGradientFn(config.baseColors, config.nrOfSteps - 1)

function drawLine(start, end, color) {
  const line = two.makeLine(start.x, start.y, end.x, end.y)
  line.stroke = color

  return line
}

function update(frameCount, timeDelta) {
  // calculate the angle of a circle
  const angle = (2 * Math.PI / 720) * frameCount
  
  const lineLength = 100
  const start = { x: mouseVector.x, y: mouseVector.y }
  const end = {
    x: (mouseVector.x + (lineLength * Math.cos(angle))),
    y: (mouseVector.y + (lineLength * Math.sin(angle)))
  }

  drawLine(start, end, getColorFromGradient(eternalIterator.next() + 1))
}
