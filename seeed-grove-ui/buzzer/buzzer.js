/**
 * Copyright 2015, 2015 MakerCollider.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
module.exports = function(RED){ 
    var checkPin = require("node-red-contrib-smartnode/extends/check_pin");
    var upmBuzzer = require("jsupm_buzzer");
    function buzzer(config) {
        RED.nodes.createNode(this, config);
        this.pwmPin = config.pwmPin;
        this.tone = config.tone
        var node = this;
	    node.pwmPin = node.pwmPin>>>0;
        
        var key = 'P'+node.pwmPin;
        if (checkPin.getDigitalPinValue(key)==1){
            node.status({fill: "red", shape: "dot", text: "pin repeat"});
            console.log('Buzzer pwm pin ' + node.pwmPin +' repeat');
            return;
        }
        else if (checkPin.getDigitalPinValue(key)==0){
            checkPin.setDigitalPinValue(key, 1);
            node.status({fill: "blue", shape: "ring", text: "pin check pass"});
            console.log('Buzzer pwm pin ' + node.pwmPin +' OK');
        }
        else{
            node.status({fill: "blue", shape: "ring", text: "Unknown"});
            console.log('unknown pin' + node.pwmPin + ' key value' + checkPin.getDigitalPinValue(key));
            return;
        }
        function setPwmto0(pin) {                                                                      
            var mraa =require("mraa");                                                                 
            var exec = require('child_process').exec;                                                  
            var gpio = new mraa.Gpio(pin);                                                             
            var cmd1 = "echo " + pin + " > /sys/class/gpio/unexport";                                  
            var cmd2 = "echo " + pin + " > /sys/class/gpio/export";                                    
            gpio.dir(mraa.DIR_OUT);                                                                    
            exec(cmd1,0);                                                                              
            gpio.write(0);                                                                             
            exec(cmd2,0);                                                                              
        }  

        var myBuzzer;
        var myinterval;
        this.on('input',function(msg) {
            console.log("msg:" + msg.payload);
            myBuzzer = new upmBuzzer.Buzzer(node.pwmPin);
            if (msg.payload == 1){
                console.log("tone:" + node.tone);                                                      
                if (node.tone == 1)                                                                    
                    myBuzzer.playSound(upmBuzzer.DO, 0);                                     
                if (node.tone == 2)                                                                    
                    myBuzzer.playSound(upmBuzzer.RE, 0);                                     
                if (node.tone == 3)                                                                    
                    myBuzzer.playSound(upmBuzzer.MI, 0);                                     
                if (node.tone == 4)                                                                    
                    myBuzzer.playSound(upmBuzzer.FA, 0);                                     
                if (node.tone == 5)                                                                    
                    myBuzzer.playSound(upmBuzzer.SOL, 0);                                    
                if (node.tone == 6)                                                                    
                    myBuzzer.playSound(upmBuzzer.LA, 0);                                     
                if (node.tone == 7)                                                                    
                    myBuzzer.playSound(upmBuzzer.SI, 0); 
                if (node.tone > 7 || node.tone < 1)                
                    node.status({fill: "red", shape: "ring", text: "please check the tone value"});
                var msg = { payload:1 };
                node.send(msg);
            }
            else {
                myBuzzer.stopSound();
                setPwmto0(node.pwmPin);   
                var msg = { payload:0 };
                node.send(msg);
            }
        });
        this.on('close', function() {
            clearInterval(myinterval);
            checkPin.initDigitalPin();  //init pin
        });
    }
    RED.nodes.registerType("Seeed-Buzzer", buzzer);
}
