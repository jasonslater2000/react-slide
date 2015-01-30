'use strict';

var React      = require('react')
var assign     = require('object-assign')
var DragHelper = require('drag-helper')
var Region     = require('region')

var stringOrNumber = React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number
])

function clamp(value, min, max){

    if (typeof min === 'undefined'){
        min = value
    }
    if (typeof max === 'undefined'){
        min = value
    }

    var aux
    if (min > max){
        aux = min
        min = max
        max = aux
    }

    return value < min?
                min:
                value > max?
                    max:
                    value
}

function emptyFn(){}

function getValue(props, state){
    var hasDefaultValue = typeof props.defaultValue != 'undefined'

    var value = hasDefaultValue?
                    props.defaultValue:
                    props.value

    if (state.dragging || hasDefaultValue){
        value = typeof state.value != 'undefined'?
                    state.value:
                    props.defaultValue
    }

    return value
}

function toValue(value, props){
    return props.toStep(
            clamp(value, props.startValue, props.endValue),
            props.step
        )
}

function absoluteCenter(style){
    style = style || {}

    style.margin = 'auto'
    style.position = 'absolute'
    style.top = style.bottom = style.left = style.right = 0

    return style
}

function getPercentageForValue(value, props){
    value = value || 0

    var range = props.endValue - props.startValue
    var diff  = value - props.startValue

    return diff * 100 / range
}

function getValueForPercentage(percentage, props){
    var value = percentage * (props.endValue - props.startValue) / 100

    return value
}

function valueToStep(value, step){
    if (!step){
        return value
    }

    var fn = function(value){ return value }
    var diff

    value = fn(value)
    diff  = fn(value % step)

    if (diff > fn(step / 2) ){
        value += -diff + step
    } else {
        value += -diff
    }

    return value
}

function getOffset(value, props){
    value = getPercentageForValue(value || 0, props)

    return 100 - value
}

function positionStyle(value, props, style){
    style = style || {}

    var offset = getOffset(value, props)// + '%'
    var horiz  = props.orientation == 'horizontal'

    style[horiz?'width':'height'] = 100 - offset + '%'

    return style
}

module.exports = React.createClass({

    displayName: 'ReactSlider',

    propTypes: {
        minValue: stringOrNumber,
        maxValue: stringOrNumber,

        startValue: stringOrNumber.isRequired,
        endValue: stringOrNumber.isRequired,

        value: stringOrNumber,

        step: stringOrNumber,
        tickStep: stringOrNumber,
        ticks: React.PropTypes.array,

        toStep  : React.PropTypes.func,
        onDrag  : React.PropTypes.func,
        onChange: React.PropTypes.func,

        handleSize: stringOrNumber,

        orientation: function(props, propName){
            var value = props[propName]

            if (value != 'horizontal' && value != 'vertical'){
                return new Error('orientation must be either "horizontal" or "vertical"')
            }
        }
    },

    getDefaultProps: function(){
        return {
            orientation: 'horizontal',
            startValue: 0,
            endValue: 100,
            step: 1,

            trackRadius: 0,
            statefulDrag: true,

            enableTrackClick: true,

            defaultStyle: {

            },

            defaultHorizontalStyle: {
                height: 20,
                width: 200
            },

            defaultVerticalStyle: {
                height: 200,
                width: 20
            },

            defaultTrackStyle: absoluteCenter({
                position: 'relative',
                cursor: 'pointer',
                backgroundColor: 'rgb(216, 216, 213)'
            }),

            defaultHorizontalTrackStyle: {
                height: 10
            },

            defaultVerticalTrackStyle: {
                width: 10
            },

            defaultTrackFillStyle: {
                position: 'absolute',
                width   : '100%',
                height  : '100%',
                boxSizing: 'content-box',
                backgroundColor: 'gray'
            },

            defaultTrackLineStyle: {
                position: 'absolute'
            },
            defaultHorizontalTrackLineStyle: {
                height: '100%'
            },
            defaultVerticalTrackLineStyle: {
                width: '100%'
            },

            defaultHandleStyle: {
                position: 'absolute',
                backgroundColor: '#3f51b5',
                cursor: 'pointer',
                zIndex: 1
            },
            defaultHorizontalHandleSize: {
                width : 10,
                height: 20
            },
            defaultVerticalHandleSize: {
                width : 20,
                height: 10
            },
            defaultHorizontalHandleStyle: {
                transform: 'translate3d(0px, -50%, 0px)',
                top: '50%'
            },
            defaultVerticalHandleStyle: {
                transform: 'translate3d(-50%, 0px, 0px)',
                left: '50%'
            },
            defaultTickStyle: {
                boxSizing: 'border-box',
                position: 'absolute',
                borderStyle: 'solid',
                borderWidth: 0
            },
            defaultHorizontalTickStyle: {
                height: '100%'
            },
            defaultVerticalTickStyle: {
                width: '100%'
            },
            defaultWrapStyle: {
                position: 'relative',
                height: '100%'
            },
            defaultTickWrapStyle: {
                position: 'absolute'
            },
            tickColor: 'rgb(172, 172, 172)',
            tickWidth: 1,
            toStep: valueToStep
        }
    },

    getInitialState: function(){
        return {}
    },

    render: function() {

        var props = this.prepareProps(this.props, this.state)
        var track = this.renderTrack(props, this.state)
        var ticks = this.renderTicks(props, this.state)

        var wrapStyle = assign({}, props.defaultWrapStyle, props.wrapStyle)

        return React.createElement("div", React.__spread({},  props), 
            React.createElement("div", {className: "z-wrap", style: wrapStyle}, 
                ticks, 
                track
            )
        )
    },

    prepareProps: function(thisProps, state){
        var props = {}

        assign(props, thisProps)
        props.horizontal = props.orientation === 'horizontal'

        props.style       = this.prepareStyle(props)
        props.handleStyle    = this.prepareHandleStyle(props)
        props.trackStyle     = this.prepareTrackStyle(props)
        props.trackLineStyle = this.prepareTrackLineStyle(props)
        props.trackFillStyle = this.prepareTrackFillStyle(props)
        props.tickStyle      = this.prepareTickStyle(props)

        props.value = this.toValue(getValue(props, state), props)

        props.className = this.prepareClassName(props)

        return props
    },

    prepareClassName: function(props) {
        var className = props.className || ''
        var horiz = props.horizontal
        var orientationClass = horiz? 'z-orientation-horizontal': 'z-orientation-vertical'

        className += ' ' + orientationClass
        className += ' z-slider'

        return className
    },

    toValue: function(value, props){
        props = props || this.props

        return toValue(value, props)
    },

    prepareStyle: function(props){
        var orientationStyle = props.horizontal? props.defaultHorizontalStyle: props.defaultVerticalStyle
        return assign({}, props.defaultStyle, orientationStyle, props.style)
    },

    prepareHandleStyle: function(props) {
        var horiz = props.horizontal
        var orientationStyle = horiz? props.defaultHorizontalHandleStyle: props.defaultVerticalHandleStyle

        var handleStyle = assign({}, props.defaultHandleStyle, orientationStyle, props.handleStyle)
        var handleSize  = this.getHandleSize(props)

        handleStyle.width = typeof handleStyle.width === 'undefined'? handleSize.width: handleStyle.width
        handleStyle.height = typeof handleStyle.height === 'undefined'? handleSize.height: handleStyle.height

        return handleStyle
    },

    prepareTickStyle: function(props) {
        var horiz = props.horizontal
        var side = horiz? 'left': 'top'
        var orientationStyle = horiz? props.defaultHorizontalTickStyle: props.defaultVerticalTickStyle
        var style = assign({}, props.defaultTickStyle, orientationStyle, props.tickStyle)

        if (horiz){
            style.borderLeftWidth = style.borderLeftWidth || props.tickWidth
            style.borderLeftColor = style.borderLeftColor || props.tickColor
            style.marginLeft      = -props.tickWidth/2
        } else {
            style.borderTopWidth = style.borderTopWidth || props.tickWidth
            style.borderTopColor = style.borderTopColor || props.tickColor
            style.marginTop      = -props.tickWidth/2
        }

        return style
    },

    prepareTrackStyle: function(props) {
        var horiz = props.horizontal
        var trackOrientationStyle = horiz? props.defaultHorizontalTrackStyle: props.defaultVerticalTrackStyle
        var trackStyle = assign({}, props.defaultTrackStyle, trackOrientationStyle, props.trackStyle)

        if (props.trackRadius){
            trackStyle.borderRadius = typeof trackStyle.borderRadius === 'undefined'?
                                        props.trackRadius:
                                        trackStyle.borderRadius
        }

        return trackStyle
    },

    prepareTrackLineStyle: function(props) {
        var horiz = props.horizontal
        var orientationStyle = horiz? props.defaultHorizontalTrackLineStyle: props.defaultVerticalTrackLineStyle
        var trackLineStyle = assign({}, props.defaultTrackLineStyle, orientationStyle, props.trackLineStyle)

        return trackLineStyle
    },

    prepareTrackFillStyle: function(props) {
        var horiz = props.horizontal
        var trackFillStyle = assign({}, props.defaultTrackFillStyle, props.trackFillStyle)

        if (props.trackRadius){
            if (horiz){
                trackFillStyle.borderTopLeftRadius    = trackFillStyle.borderTopLeftRadius    || props.trackRadius
                trackFillStyle.borderBottomLeftRadius = trackFillStyle.borderBottomLeftRadius || props.trackRadius
            } else {
                trackFillStyle.borderTopLeftRadius  = trackFillStyle.borderTopLeftRadius  || props.trackRadius
                trackFillStyle.borderTopRightRadius = trackFillStyle.borderTopRightRadius || props.trackRadius
            }
        }

        return trackFillStyle
    },

    renderTrack: function(props, state){

        var value = props.value
        var horiz = props.horizontal

        var trackStyle     = props.trackStyle
        var trackLineStyle = props.trackLineStyle
        var trackFillStyle = props.trackFillStyle

        positionStyle(value, props, trackFillStyle)

        var handleSize = {
            width : props.handleStyle.width,
            height: props.handleStyle.height
        }
        var size

        if (horiz){
            size = handleSize.width / 2

            trackLineStyle.left  = size
            trackLineStyle.right = size
            trackFillStyle.paddingLeft = size
            trackFillStyle.marginLeft  = -size
        } else {

            size = handleSize.height / 2

            trackLineStyle.top    = size
            trackLineStyle.bottom = size
            trackFillStyle.paddingTop = size
            trackFillStyle.marginTop  = -size
        }

        var handle = this.renderHandle(props, state)

        return (
                React.createElement("div", {className: "z-track", style: trackStyle, onMouseDown: this.handleTrackMouseDown.bind(this, props)}, 
                    React.createElement("div", {ref: "trackLine", className: "z-track-line", style: trackLineStyle}, 
                        React.createElement("div", {className: "z-track-fill", style: trackFillStyle}), 
                        handle
                    )

                )
        )
    },

    renderTicks: function(props, state){

        var horiz = props.orientation === 'horizontal'
        var ticks = props.ticks = this.prepareTicks(props)
        var handleSize = {
            width : props.handleStyle.width,
            height: props.handleStyle.height
        }

        if (!ticks || !ticks.length){
            return
        }

        var tickWrapStyle = assign({}, props.defaultTickWrapStyle, props.tickWrapStyle)

        if (horiz){
            tickWrapStyle.left = tickWrapStyle.right = handleSize.width / 2
            tickWrapStyle.height = '100%'
        } else {
            tickWrapStyle.top = tickWrapStyle.bottom = handleSize.height / 2
            tickWrapStyle.width = '100%'
        }

        return (
            React.createElement("div", {style: tickWrapStyle}, 
                ticks.map(this.renderTick.bind(this, props))
            )
        )
    },

    renderTick: function(props, tickValue){

        var side  = props.horizontal? 'right':'bottom'
        var style = assign({}, props.tickStyle)

        style[side] = getOffset(tickValue, props) + '%'

        var tickProps = {
            key: tickValue + '-tick',
            'data-value': tickValue,
            style: style
        }

        if (props.tickFactory){
            return props.tickFactory(tickProps)
        }

        return React.createElement("div", React.__spread({},  tickProps))
    },

    prepareTicks: function(props){
        var ticks = props.ticks

        if (props.tickStep){

            var ticks = []
            var start = props.startValue
            var end   = props.endValue
            var step  = props.tickStep * 1

            while ((start + step) < end){
                start += step
                ticks.push(start)
            }
        }

        return ticks
    },

    getHandleSize: function(props){
        var obj = props.orientation === 'horizontal'?
                    props.defaultHorizontalHandleSize:
                    props.defaultVerticalHandleSize
        return {
            width : props.handleWidth || props.handleSize || obj.width,
            height: props.handleHeight || props.handleSize || obj.height,
        }
    },

    renderHandle: function(props, state){
        var value = props.value

        var handleStyle = props.handleStyle
        var handleSize  = this.getHandleSize(props)

        handleSize.width = handleStyle.width
        handleSize.height = handleStyle.height

        var offset = 100 - getOffset(value, props) + '%'

        if (props.horizontal){
            handleStyle.left = offset
            handleStyle.marginLeft = -handleSize.width/2
            handleStyle.marginTop  = handleStyle.marginBottom = 'auto'
            // handleStyle.top = handleStyle.bottom = 0
        } else {
            handleStyle.top = offset
            handleStyle.marginTop = -handleSize.height/2
            handleStyle.marginLeft = handleStyle.marginRight = 'auto'
        }

        if (props.trackRadius){
            handleStyle.borderRadius = typeof handleStyle.borderRadius === 'undefined'? props.trackRadius: handleStyle.borderRadius
        }

        var handleProps = {
            ref: 'handle',
            className: 'z-handle',
            'data-value': value,
            sliderProps: props,
            onMouseDown: this.handleMouseDown.bind(this, props),
            style: handleStyle
        }

        return (props.handleFactory || React.DOM.div)(handleProps)
    },

    handleTrackMouseDown: function(props, event){
        if (!props.enableTrackClick){
            return
        }
        var horiz = props.orientation === 'horizontal'
        var region = Region.from(this.getTrackDOMNOde())
        var dragSize = this.getAvailableDragSize(props)
        var handleSize = props.handleStyle[horiz? 'width': 'height']

        var offset = horiz?
                        event.pageX - region.left:
                        event.pageY - region.top

        var percentage = offset * 100 / dragSize

        this.setValue(getValueForPercentage(percentage, props))
    },

    handleMouseDown: function(props, event){
        event.preventDefault()
        event.stopPropagation()

        this.setupDrag(event, props)
    },

    getHandle: function(){
        return this.refs.handle.getDOMNode()
    },

    getInitialDragValue: function(props, state){
        var initialValue = typeof this.state.value != 'undefined'?
                            this.state.value:
                            typeof props.defaultValue == 'undefined'?
                                props.value:
                                props.defaultValue

        return initialValue
    },

    getTrackDOMNOde: function() {
        return this.refs.trackLine.getDOMNode()
    },

    getAvailableDragSize: function(props){
        var horiz  = props.orientation === 'horizontal'
        var region = Region.from(this.getTrackDOMNOde())

        return horiz?
                    region.width:
                    region.height
    },

    getRegion: function(){
        return Region.from(this.getDOMNode())
    },

    setupDrag: function(event, props, initialDiff){

        initialDiff = initialDiff || 0

        var horiz = props.orientation === 'horizontal'

        var targetRegion    = Region.from(this.getHandle())
        var constrainRegion = Region.from(this.getDOMNode())

        var dragSize     = this.getAvailableDragSize(props)
        var initialValue = props.value

        DragHelper(event, {

            scope      : this,
            region     : targetRegion,
            constrainTo: constrainRegion,

            onDragStart: function(){
                this.setState({
                    dragging: true,
                    value: props.value
                })
            },

            onDrag: function(event, config){
                var diff = (horiz? config.diff.left: config.diff.top) + initialDiff

                var percentage = diff * 100 / dragSize

                var diffValue  = getValueForPercentage(percentage, props)

                this.setValue(initialValue + diffValue, { setState: true, onDrag: true })
            },

            onDrop: function(){

                var value = this.state.value
                var state = {
                    dragging: false
                }

                if (typeof props.defaultValue == 'undefined'){
                    state.value = null
                }

                this.setState(state)

                this.notify(value)
            }
        })
    },

    notify: function(value){
        ;(this.props.onChange || emptyFn)(value)
    },

    setValue: function(value, config) {
        var props    = this.props
        var newValue = this.toValue(value, props)
        var onDrag   = config && config.onDrag

        // if (newValue != props.value){
            // if (typeof props.defaultValue != 'undefined' || onDrag){
            if (typeof props.defaultValue != 'undefined' || (this.props.statefulDrag && onDrag)){
                this.setState({
                    value: newValue
                })
            }
        // }

        if (onDrag){
            ;(props.onDrag || emptyFn)(newValue, props)
        } else {
            this.notify(value)
        }
    }
})