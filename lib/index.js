'use strict';

var React       = require('react')
var assign      = require('object-assign')
var DragHelper  = require('drag-helper')
var Region      = require('region')
var normalize   = require('react-style-normalizer')
var ReactDOM    = require('react-dom')
var EVENT_NAMES = require('react-event-names')

var absoluteCenter = require('./absoluteCenter')
var clamp          = require('./clamp')

var PropTypes = React.PropTypes

var stringOrNumber = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
])


function emptyFn(){}

function getValue(props, state){
    var value = props.value == null?
                    state.value == null? props.startValue: state.value
                    :
                    props.value

    if (state.dragging){
        value = state.value
    }

    return value
}

function toValue(value, props){
    return props.toStep(
            clamp(value, props.startValue, props.endValue),
            props.step
        )
}

function toRange(props){
    return Math.abs(props.endValue - props.startValue);
}

function getPercentageForValue(value, props){
    value = value || 0

    var range = toRange(props);
    var diff  = value - props.startValue

    return diff * 100 / range
}

function getValueForPercentage(percentage, props, config){
    var range = toRange(props);
    var value = percentage * range / 100

    var noStartValue = config && config.noStartValue
    var v = noStartValue? value: props.startValue + value

    return v;
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

    var offset = getOffset(value, props)
    var horiz  = props.orientation == 'horizontal'

    style[horiz? 'width': 'height'] = 100 - offset + '%'

    return style
}

var DISPLAY_NAME = 'ReactSlider'

module.exports = React.createClass({

    displayName: DISPLAY_NAME,

    propTypes: {
        minValue: stringOrNumber,
        maxValue: stringOrNumber,

        startValue: stringOrNumber.isRequired,
        endValue  : stringOrNumber.isRequired,

        value: stringOrNumber,

        step    : stringOrNumber,
        tickStep: stringOrNumber,
        ticks   : React.PropTypes.array,

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
            'data-display-name': DISPLAY_NAME,

            smallTickPercentage: 80,
            orientation        : 'horizontal',

            startValue: 0,
            endValue  : 100,

            step: 1,

            trackRadius: 0,
            statefulDrag: true,

            enableTrackClick: true,

            defaultStyle: {

            },

            defaultHorizontalStyle: {
                height: 20,
                width : 200
            },

            defaultVerticalStyle: {
                height: 200,
                width : 20
            },

            defaultTrackStyle: absoluteCenter({
                position: 'relative',
                cursor: 'pointer',
                background: 'rgb(218, 218, 218)'
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
                background: 'rgb(120, 120, 120)'
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
                background: 'rgb(103, 175, 233)',
                cursor: 'pointer',
                zIndex: 1
            },

            defaultOverHandleStyle: {
                background: 'rgb(118, 181, 231)'
            },

            defaultActiveHandleStyle: {
                background: 'rgb(90, 152, 202)'
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
        return {
            value: this.props.defaultValue
        }
    },

    componentWillReceiveProps: function(newProps){
        this.tickCache = null
    },

    render: function() {

        var props = this.prepareProps(this.props, this.state)
        var track = this.renderTrack(props, this.state)

        var ticks = this.tickCache?
                        this.tickCache:
                        this.renderTicks(props, this.state)

        this.tickCache = ticks

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

        props.style          = this.prepareStyle(props)
        props.handleStyle    = this.prepareHandleStyle(props)
        props.trackStyle     = this.prepareTrackStyle(props)
        props.trackLineStyle = this.prepareTrackLineStyle(props)
        props.trackFillStyle = this.prepareTrackFillStyle(props)
        props.tickStyle      = this.prepareTickStyle(props)

        props.value = this.toValue(getValue(props, state), props)

        props.className = this.prepareClassName(props)

        props.onDrag = null

        return props
    },

    prepareClassName: function(props) {
        var className = props.className || ''
        var horiz = props.horizontal
        var orientationClass = horiz?
                'z-orientation-horizontal': 'z-orientation-vertical'

        className += ' ' + orientationClass
        className += ' z-slider'

        return className
    },

    toValue: function(value, props){
        props = props || this.props

        return toValue(value, props)
    },

    prepareStyle: function(props){
        var orientationStyle = props.horizontal?
                                props.defaultHorizontalStyle:
                                props.defaultVerticalStyle

        return normalize(assign({}, props.defaultStyle, orientationStyle, props.style))
    },

    prepareHandleStyle: function(props) {
        var horiz = props.horizontal
        var orientationStyle = horiz? props.defaultHorizontalHandleStyle: props.defaultVerticalHandleStyle

        var defaultActiveHandleStyle
        var activeHandleStyle

        if (this.state.handleMouseDown){
            defaultActiveHandleStyle = props.defaultActiveHandleStyle
            activeHandleStyle = props.activeHandleStyle
        }

        var defaultOverHandleStyle
        var overHandleStyle

        if (this.state.handleMouseOver){
            defaultOverHandleStyle = props.defaultOverHandleStyle
            overHandleStyle = props.overHandleStyle
        }

        var handleStyle = assign({},
                            props.defaultHandleStyle,
                            orientationStyle,
                            defaultOverHandleStyle,
                            defaultActiveHandleStyle,

                            props.handleStyle,
                            overHandleStyle,
                            activeHandleStyle
                        )
        var handleSize  = this.getHandleSize(props)

        handleStyle.width  = typeof handleStyle.width  === 'undefined'? handleSize.width : handleStyle.width
        handleStyle.height = typeof handleStyle.height === 'undefined'? handleSize.height: handleStyle.height

        return normalize(handleStyle)
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

        return normalize(style)
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

        return normalize(trackStyle)
    },

    prepareTrackLineStyle: function(props) {
        var horiz = props.horizontal

        var orientationStyle = horiz?
                                props.defaultHorizontalTrackLineStyle:
                                props.defaultVerticalTrackLineStyle

        var trackLineStyle = assign({}, props.defaultTrackLineStyle, orientationStyle, props.trackLineStyle)

        return normalize(trackLineStyle)
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

    renderTicks: function(props){

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

    renderTick: function(props, tick){

        var tickValue
        var tickStyle
        var type = 'big'

        if (typeof tick == 'object'){
            tickValue = tick.value
            tickStyle = tick.style
            type = tick.type || type
        } else {
            tickValue = tick
        }

        if (type == 'small'){
            tickStyle = tickStyle || {}

            var percentage = parseFloat(props.smallTickPercentage)
            tickStyle[props.horizontal? 'top': 'left'] = ((100 - percentage) / 2) + '%'
            tickStyle[props.horizontal? 'height': 'width'] = percentage + '%'
        }

        var side  = props.horizontal? 'right':'bottom'
        var style = assign({}, props.tickStyle, tickStyle)

        style[side] = getOffset(tickValue, props) + '%'

        var tickProps = {
            key         : tickValue + '-tick',
            value       : tickValue,
            orientation : props.orientation,
            type        : type,
            'data-value': tickValue,
            style       : style
        }

        var defaultFactory = React.DOM.div
        var factory = props.tickFactory || defaultFactory

        var result = factory(tickProps)

        if (result === undefined){
            result = defaultFactory(tickProps)
        }

        return result
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

        handleSize.width  = handleStyle.width
        handleSize.height = handleStyle.height

        var offset = 100 - getOffset(value, props) + '%'

        if (props.horizontal){
            handleStyle.left = offset
            handleStyle.marginLeft = -handleSize.width/2
            handleStyle.marginTop  = handleStyle.marginBottom = 'auto'
            handleStyle.transform  = 'translate3d(0px, -50%, 0px)'
        } else {
            handleStyle.top = offset
            handleStyle.marginTop = -handleSize.height/2
            handleStyle.marginLeft = handleStyle.marginRight = 'auto'
            handleStyle.transform = 'translate3d(-50%, 0px, 0px)'
        }

        if (props.trackRadius){
            handleStyle.borderRadius = typeof handleStyle.borderRadius === 'undefined'? props.trackRadius: handleStyle.borderRadius
        }

        var handleProps = {
            ref: 'handle',
            className: 'z-handle',
            'data-value': value,
            orientation: props.orientation,
            value: value,
            dragging: state.dragging,
            mouseDown: state.handleMouseDown,
            sliderProps: props,
            style: normalize(handleStyle),
            onMouseEnter: this.handleMouseEnter,
            onMouseLeave: this.handleMouseLeave
        }

        handleProps[EVENT_NAMES.onMouseDown] = this.handleMouseDown.bind(this, props)

        var defaultFactory = React.DOM.div
        var factory = props.handleFactory || defaultFactory

        var result = factory(handleProps)

        if (result === undefined){
            result = defaultFactory(handleProps)
        }

        return result
    },

    handleMouseEnter: function() {
        this.setState({
            handleMouseOver: true
        })
    },

    handleMouseLeave: function() {
        this.setState({
            handleMouseOver: false
        })
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
        return ReactDOM.findDOMNode(this.refs.handle)
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
        return ReactDOM.findDOMNode(this.refs.trackLine)
    },

    getAvailableDragSize: function(props){
        var horiz  = props.orientation === 'horizontal'
        var region = Region.from(this.getTrackDOMNOde())

        return horiz?
                    region.width:
                    region.height
    },

    getRegion: function(){
        return Region.from(ReactDOM.findDOMNode(this))
    },

    setupDrag: function(event, props, initialDiff){

        initialDiff = initialDiff || 0

        var horiz = props.orientation === 'horizontal'

        var targetRegion    = Region.from(this.getHandle())
        var constrainRegion = Region.from(ReactDOM.findDOMNode(this))

        var dragSize     = this.getAvailableDragSize(props)
        var initialValue = props.value

        this.setState({
            handleMouseDown: true
        })

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
                var diffValue = getValueForPercentage(percentage, props, { noStartValue: true})

                this.setValue(initialValue + diffValue, { onDrag: true })
            },

            onDrop: function(){

                var value = this.state.dragging?
                                this.state.value:
                                props.value

                var state = {
                    dragging: false,
                    handleMouseDown: false
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

        if (typeof props.defaultValue != 'undefined' || (this.props.statefulDrag && onDrag)){
            this.setState({
                value: newValue
            })
        }

        if (onDrag){
            ;(props.onDrag || emptyFn)(newValue, props)
        } else {
            this.notify(newValue)
        }
    }
})