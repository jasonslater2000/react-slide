react-slide
===========

React Slider

## Example

```jsx
var VALUE = 45
function onChange(newValue){
  //...
}

<Slider
  startValue={0}
  endValue={100}
  value={VALUE}
  onChange={onChange}
/>

<Slider
  orientation="vertical"
  startValue={-10}
  endValue={-10}
  value={5}
  tickStep={5}
  handleSize={20}
/>
```


## Properties

 * value - for controlled behaviour
 * defaultValue - for uncontrolled behaviour
 * orientation: String - either 'horizontal' or 'vertical'. Defaults to horizontal
 * onChange: Function(value)
 * onDrag: Function(value)
 * step: Number - defaults to 1
 * startValue: Number - defaults to 0
 * endValue: Number - defaults to 100
 * tickStep: Number
 * ticks: Number[]
 * tickWidth: Number
 * tickFactory: Function
 * tickColor: String
 * trackRadius: Number
 * trackFillStyle
 * handleFactory
 * handleStyle
 * handleWidth
 * handleHeight
 * handleSize
