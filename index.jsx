'use strict';

var React = require('react')
var Slider = require('./src')

require('./index.styl')

var VALUE = 90

var App = React.createClass({

    onChange: function(value){
        VALUE = value
        this.setState({})
    },



    render: function() {

        var firstStyle = {
            border: '1px solid gray',
            height: 40,
            margin: 10
            // ,
            // padding: 10
        }

        var secondStyle = {
            border: '1px solid gray',
            height: 400,
            width: 20,
            margin: 10
        }

        return (
            <div className="App" style={{padding: 10}}>
            <Slider
                tickStep={10}
                trackRadius={0}
                handleWidth={20}
                handleHeight='100%'
                trackStyle={{height: 20}}
                orientation="horizontal" handleSize={20} style={firstStyle} onDrag={this.onChange} value={VALUE} onChangex={this.onChange}/>

                <Slider
                    handleWidth={'100%'}
                    handleHeight={20}
                    orientation="vertical" handleSize={20} style={secondStyle} onDrag={this.onChange} value={VALUE} onChangex={this.onChange}/>
            </div>
        )
    }
})

React.render(<App />, document.getElementById('content'))