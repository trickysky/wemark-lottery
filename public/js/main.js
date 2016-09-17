/**
 * Created by tk on 16/9/6.
 */
$(function () {
    var token = $('#token').text(),
        id = $('#id').text(),
        _csrf = $('#_csrf').text(),
        longitude ,
        latitude,
        received = '1' == $('#received').text(),
        drawn = '1' == $('#drawn').text(),
        type = $('#type').text(),
        prize_msg = $('#msg').text();

    var prizeInfo = {
        '0': {
            'winId': 7
        },
        '1': {
            'winId': 2,
            'prize-level': '一等奖',
        },
        '2': {
            'winId': 4,
            'prize-level': '二等奖',
        },
        '3': {
            'winId': 10,
            'prize-level': '三等奖',
        }
    };

    $('#start-btn').bind('click', function () {
        $('#start-btn').remove();
        $('#message-content').html('<i class="fa fa-spinner fa-spin fa-fw"></i>');
        if (!navigator.geolocation) {
            $('#message-content').text('浏览器不支持获取位置, 无法参与抽奖!');
        }

        function success(position) {
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;
            $('#message').removeClass('text-center');
            $('#message button').removeClass('hide');
            $.ajax({
                type: 'POST',
                url: '/lottery/locate',
                data: {
                    'token': token,
                    'id': id,
                    '_csrf': _csrf,
                    'longitude': longitude,
                    'latitude': latitude
                },
                ContentType: "application/x-www-form-urlencoded",
                dataType: "json",
                success: function (data) {
                    $('#message i').remove();
                    if (0 == data['code']) {
                        type = data['data']['type'];
                        received = data['data']['received'];
                        drawn = data['data']['drawn'];
                        prize_msg = data['data']['msg'];
                        if (drawn) {
                            if (received) {
                                $('#message-content').text('您已兑奖成功, 感谢您的支持!');
                            }
                            else {
                                if ('0' == type) {
                                    $('#message-content').text('您已抽奖, 很遗憾您没有中奖, 感谢您的支持!')
                                }
                                else {
                                    $('#message-content').html(prize_msg + ', <span class="confirm-btn" style="color: red">点击前往领奖</span>');
                                    $('.confirm-btn').bind('click', confirmQuery);
                                }
                            }
                        }
                        else {
                            $('#message').addClass('hide');
                            $('.background').removeClass('hide');
                            $('.background').height($('.background').width() * 0.8);
                            $('.wrapper .background .prizes li').css({
                                'line-height': String($('.wrapper .background .prizes li').height()) + 'px',
                                'font-size': String($('.wrapper .background .prizes li').height() / 4) + 'px'
                            });
                            $('.wrapper .background .dashboard a').css({
                                'line-height': String($('.wrapper .background .dashboard a').height()) + 'px',
                                'font-size': String($('.wrapper .background .dashboard a').height() / 3) + 'px'
                            });
                        }
                    }
                    else {
                        $('#message-content').text(data['msg']);
                    }
                },
                error: function (xml, e) {
                    $('#message i').remove();
                    $('#message-content').text('something error');
                    console.log(e);
                }
            });

            console.log(latitude, longitude);
        }

        function error() {
            $('#message').removeClass('text-center');
            $('#message button').removeClass('hide');
            $('#message i').remove();
            $('#message-content').text('无法获取您的位置, 无法参与抽奖!');
        }

        navigator.geolocation.getCurrentPosition(success, error);
    });

    $('.confirm-btn').bind('click', confirmQuery);

    function confirmQuery() {
        $.ajax({
            type: 'POST',
            url: '/lottery/confirm',
            data: {
                'token': token,
                '_csrf': _csrf,
                'longitude': longitude,
                'latitude': latitude
            },
            dataType: "json",
            ContentType: "application/x-www-form-urlencoded",
            success: function (data) {
                if (0 == data['code']) {
                    $('#message-content').text('领奖成功, 请前往微信钱包查看!');
                }
                else {
                    $('#message-content').text(data['msg']);
                }
                $('#prize-info').modal('hide');
                $('#message').removeClass('hide');
            }
        });
        $('.confirm-btn').unbind('click');
    }

    $('#lottery-start').bind('click', function () {
        $('#lottery-start').unbind('click');
        $('.drawbtn').css({
            'background-color': '#b1b0b0',
            'color': '#484545',
            'text-decoration': 'none'
        });
        $('.prizes').lottery({
            winId: Math.ceil(prizeInfo[type]['winId'] - 1),
            round: 3,
            time: 5,
            activeClass: 'active',
            effect: 'Cubic',
            finish: function () {
                if ('0' == type) {
                    $('.modal-body p').text('很遗憾你没有中奖, 感谢您的支持!');
                    $('#confirm').hide()
                }
                else {
                    $('.modal-body p .prize-text').text(prize_msg);
                    $('#close-modal').bind('click', function () {
                        $('#lottery-start').bind('click', confirmQuery);
                        $('#lottery-start').html('前去领奖');
                        $('#lottery-start').addClass('confirm-btn');
                        $('#lottery-start').css({
                            'background-color': '#ff6a30',
                            'color': '#ffed8a'
                        });
                        $('#close-modal').unbind('click');
                    });
                }
                $('#prize-info').modal('show');
            }
        })
    });
});