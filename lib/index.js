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
    // }

    var result = diff * 100 / range

    // console.log(value, ' = ', result)

    return result
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

    var offset = getOffset(value, props) + '%'
    var horiz  = props.orientation == 'horizontal'

    style[horiz? 'right' : 'bottom'] = offset
    style[horiz? 'bottom':'right'] = 0

    return style
}

function isStartValueRespected(value, props){
    return value >= props.startValue
}

function isEndValueRespected(value, props){
    return value <= props.endValue
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
        // shiftStep: stringOrNumber,

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

            defaultStyle: {
                position: 'relative'
            },

            defaultTrackStyle: absoluteCenter({
                position: 'relative',
                cursor: 'pointer'
            }),

            defaultTrackFillStyle: {
                position: 'absolute',
                width   : '100%',
                height  : '100%',
                backgroundColor: 'gray'
            },

            defaultTrackLineStyle: absoluteCenter({
                // overflow: 'hidden'
            }),

            defaultHandleStyle: {
                position: 'absolute',
                backgroundColor: 'red',
                cursor: 'pointer'
            },
            toStep: valueToStep
        }
    },

    getInitialState: function(){
        return {}
    },

    render: function() {

        var props = this.prepareProps(this.props, this.state)
        var track = this.renderTrack(props, this.state)

        return React.createElement("div", React.__spread({},  props), 
            track
        )
    },

    prepareProps: function(thisProps, state){
        var props = {}

        assign(props, thisProps)

        props.style = this.prepareStyle(props)
        props.value = this.toValue(getValue(props, state), props)

        return props
    },

    toValue: function(value, props){
        props = props || this.props

        return toValue(value, props)
    },

    prepareStyle: function(props){
        var style = {}

        assign(style, props.defaultStyle, props.style)

        return style
    },

    renderTrack: function(props, state){

        var value = props.value

        var trackStyle     = assign({}, props.defaultTrackStyle, props.trackStyle)
        var trackLineStyle = assign({}, props.defaultTrackLineStyle, props.trackLineStyle)
        var trackFillStyle = assign({}, props.defaultTrackFillStyle, props.trackFillStyle)

        positionStyle(value, props, trackFillStyle)

        trackStyle.overflow = 'hidden'

        var handleSize = this.getHandleSize(props)

        if (props.orientation === 'horizontal'){
            trackLineStyle.left  = handleSize.width / 2
            trackLineStyle.right = handleSize.width / 2
        } else {
            trackLineStyle.borderTop    = handleSize.height / 2 + 'px solid transparent'
            trackLineStyle.borderBottom = handleSize.height / 2 + 'px solid transparent'
        }

        var handle = this.renderTrackHandle(props, state)

        return React.createElement("div", {className: "z-track", style: trackStyle, onMouseDown: this.handleTrackMouseDown}, 
                React.createElement("div", {className: "z-track-fill", style: trackFillStyle}), 
            React.createElement("div", {className: "z-track-line", style: trackLineStyle}, 
                handle
            )
        )
    },

    getHandleSize: function(props){
        return {
            width : props.handleWidth || props.handleSize,
            height: props.handleHeight || props.handleSize,
        }
    },

    renderTrackHandle: function(props, state){
        var value = props.value

        var handleSize  = this.getHandleSize(props)
        var handleStyle = assign({}, props.defaultHandleStyle, props.handleStyle, handleSize)
        var offset = 100 - getOffset(value, props) + '%'

        if (props.orientation == 'horizontal'){
            handleStyle.marginLeft = -handleSize.width/2
            handleStyle.marginTop  = 'auto'
            handleStyle.left = offset
        } else {
            handleStyle.marginTop = -handleSize.height/2
            handleStyle.marginLeft = 'auto'
            handleStyle.top = offset
        }

        return React.createElement("div", {
                    ref: "handle", 
                    'data-value': value, 
                    onMouseDown: this.handleMouseDown.bind(this, props), 
                    style: handleStyle}
                )
    },

    handleTrackMouseDown: function(event){
    },

    handleMouseDown: function(props, event){
        event.preventDefault()

        this.setupDrag(props)
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

    getAvailableDragSize: function(props){
        var horiz = props.orientation === 'horizontal'
        var dom = this.getDOMNode()
        var handleSize = this.getHandleSize(props)

        return horiz?
                    dom.clientWidth - handleSize.width:
                    dom.clientHeight - handleSize.height
    },

    getRegion: function(){
        return Region.from(this.getDOMNode())
    },

    getSizeName: function(props){
        props = props || this.props
        return props.orientation === 'horizontal'? 'width': 'height'
    },

    setupDrag: function(props, initialDiff){

        initialDiff = initialDiff || 0

        var horiz = props.orientation === 'horizontal'
        var sizeName = this.getSizeName(props)

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
                var newValue   = this.toValue(initialValue + diffValue, props)

                if (newValue != this.state.value){
                    this.setState({
                        value: newValue
                    })

                    ;(this.props.onDrag || emptyFn)(newValue, props)
                }
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

                ;(this.props.onChange || emptyFn)(value)
            }
        })
    }
})