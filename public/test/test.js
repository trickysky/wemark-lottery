/**
 * Created by tk on 16/9/8.
 */
var express = require('express');
var app = express();

app.all('*', function (req, res, next) {
    res.set({
        'Access-Control-Allow-origin': '*',
        'Access-Control-Allow-Headers': 'X-Requested-With',
        'Access-Control-Allow-Methods': 'GET'
    });
    next();
});

app.post('/lottery/locate', function (req, res) {
    res.send({
        "code": 0,
        "msg": "ok",
        "data": {
            "type": 3,
            "amount": 100,
            "received": false,
            "drawn": false,
            "msg": "恭喜您获得1.00元微信现金红包，将通过公众号发放，请尽快领奖！"
        }
    });
});

app.post('/lottery/confirm', function (req, res) {
    res.send({
        "code": 0,
        "msg": "微信服务器发生错误，请重试或联系客服service@wemarklinks.com，感谢您的反馈。"
    });
});

app.post('/lottery/feedback', function (req, res) {
    res.send({
        "code": 0,
        "msg": "lalala"
    });
});

app.listen(4000);
