'use strict';

var React  = require('react')
var Slider = require('./src')

var VALUE = 30

var App = React.createClass({

    onChange: function(value){

        VALUE = value
        this.setState({})
    },



    render: function() {

        var firstStyle = {
            height: 20,
            margin: 20
        }

        function renderTick(props){
            var tip

            if (props.type == 'big'){
                tip = <span style={{top: '100%', position:'absolute', left: -10}}>{props.value}</span>
            }
            return <div {...props}>
                {tip}
            </div>
        }

        function renderHandle(props){
            return <div {...props}>
                <span style={{position: 'absolute', bottom: '100%', visibility: props.mouseDown? 'visible':'hidden', color: props.mouseDown? 'red': 'blue'}}>{props.value}</span>
            </div>
        }

        return (
            <div className="App" style={{padding: 10}}>
                Current value: {VALUE}

                <Slider
                    handleFactory={renderHandle}
                    tickFactory={renderTick}
                    ticks={[0, 30, {value:50, type: 'small'}, 70, 100]}
                    style={firstStyle}
                    xonDrag={this.onChange}
                    onChange={this.onChange} value={VALUE}/>

                <Slider
                    orientation="vertical"
                    xstartValue={-20}
                    xendValue={20}
                    tickStep={5}
                    xstep={10}
                    onChange={this.onChange} value={VALUE}/>

                <Slider
                    xstartValue={-20}
                    xendValue={20}
                    trackRadius={20}
                    trackStyle={{height: 4}}
                    trackFillStyle={{backgroundColor: 'red'}}
                    handleSize={20}
                    style={{padding: 10, width: 200}}
                    onChange={this.onChange} value={VALUE}/>
            </div>
        )
    }
})

React.render(<App />, document.getElementById('content'))