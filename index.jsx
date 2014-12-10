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
            height: 20
        }

        var secondStyle = {
            // border: '1px solid gray'
            //,
            // height: 400,
            // width: 20,
            // margin: 10,
            // padding: 10
        }

        return (
            <div className="App" style={{padding: 10}}>
            {VALUE}
            <Slider
                tickStep={10}
                style={firstStyle} onDrag={this.onChange} value={VALUE} onChangex={this.onChange}/>


                <Slider
                    orientation="vertical"
                    style={secondStyle}
                    onDrag={this.onChange} value={VALUE} onChangex={this.onChange}/>
            </div>
        )
    }
})

React.render(<App />, document.getElementById('content'))