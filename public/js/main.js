/**
 * Created by tk on 16/9/6.
 */
$(function () {
    var token = $('#token').text(), id = $('#id').text(), _csrf = $('#_csrf').text(), received = '1' == $('#received').text(), drawn = '1' == $('#drawn').text(), type = $('#type').text(), prize_msg = $('#msg').text();
    var longitude, latitude;
    var scran_count = $("#scan_count").text().replace('次', '');

    if ('1' == scran_count) {
        $('#message-content').html('该商品为正品!');
    } else {
        $('#message-content').html('该商品已经重复扫码, 可能为假货, 请注意!');
    }
    $('#message').removeClass('hide');

    var first_id = [2],
        second_id = [4, 12],
        third_id = [5, 8, 10],
        noprize_id = [1, 3, 6, 7,9 ,11];
    var prizeInfo = {
        '0': {
            'winId': noprize_id[Math.floor(Math.random() * noprize_id.length)]
        },
        '1': {
            'winId': first_id[Math.floor(Math.random() * first_id.length)],
            'prize-level': '一等奖'
        },
        '2': {
            'winId': second_id[Math.floor(Math.random() * second_id.length)],
            'prize-level': '二等奖'
        },
        '3': {
            'winId': third_id[Math.floor(Math.random() * third_id.length)],
            'prize-level': '三等奖'
        }
    };


    function getLocationSuccess(position) {
        longitude = position['lng'];
        latitude = position['lat'];
        $('#message').find('button').removeClass('hide');
        $.ajax({
            type: 'POST',
            url: '/lottery/locate',
            // url: 'http://localhost:4000/lottery/locate',
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
                $('#message-content').find('i').remove();
                $('#message').removeClass('text-center');
                if (0 == data['code']) {
                    type = data['data']['type'];
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
                        $('#marquee').removeClass('hide');
                        $('#marquee').find('.background').height($('.background').width() * 0.8);
                        $('#marquee').find('.background .prizes li').css({
                            'line-height': String($('#marquee').find('.background .prizes li').height()) + 'px',
                            'font-size': String($('#marquee').find('.background .prizes li').height() / 4) + 'px'
                        });
                        $('#marquee').find('.background .dashboard a').css({
                            'line-height': String($('#marquee').find('.background .dashboard a').height()) + 'px',
                            'font-size': String($('#marquee').find('.background .dashboard a').height() / 3) + 'px'
                        });
                    }
                }
                else {
                    $('#message-content').text(data['msg']);
                }
            },
            error: function (xml, e) {
                $('#message').find('i').remove();
                $('#message-content').text('location query error');
                console.log(e);
            }
        });
        console.log(latitude, longitude);
    }
    function getLocationerr() {
        $('#message').removeClass('text-center');
        $('#message').find('button').removeClass('hide');
        $('#message').find('i').remove();
        $('#message-content').text('无法获取您的位置, 无法参与抽奖!');
    }

    $('#start-btn').bind('click', function () {
        var location = new qq.maps.Geolocation("MW4BZ-Z3KRX-FLS43-TXYL6-LFULE-7ZBRJ", "wemark-lottery");
        location.getLocation(getLocationSuccess, getLocationerr, {timeout: 8000});
        $('#start-btn').remove();
        $('#message').addClass('text-center');
        $('#message-content').html('正在定位中<i class="fa fa-spinner fa-spin fa-fw"></i>');
    });

    $('.confirm-btn').bind('click', confirmQuery);

    function confirmQuery() {
        $('.confirm-btn').unbind('click');
        $('.confirm-btn').addClass('disabled');
        $('#message-content').html('正在发放红包<i class="fa fa-spinner fa-spin fa-fw"></i>');
        $('#message').removeClass('hide');
        $('#message').addClass('text-center');
        $.ajax({
            type: 'POST',
            url: '/lottery/confirm',
            // url: 'http://localhost:4000/lottery/confirm',
            data: {
                'token': token,
                'id': id,
                '_csrf': _csrf,
                'longitude': longitude,
                'latitude': latitude
            },
            dataType: "json",
            ContentType: "application/x-www-form-urlencoded",
            success: function (data) {
                $('#message-content').find('i').remove();
                $('#message').removeClass('text-center');
                if (0 == data['code']) {
                    $('#message-content').text('领奖成功, 请前往微信钱包查看!');
                }
                else {
                    $('#message-content').text(data['msg']);
                }
                $('#message').removeClass('hide');
                $('#lottery-start').html('已抽奖');
                $('#lottery-start').addClass('disable-btn disabled');
            },
            error: function (xml, e) {
                $('#message-content').find('i').remove();
                $('#message').removeClass('text-center');
                $('#message-content').html('confirm query error');
                console.log(e);
                $('.confirm-btn').removeClass('disabled');
                $('.confirm-btn').bind('click', confirmQuery);
            },
            complete: function () {
                $('#prize-info').modal('hide');
            }
        });
    }

    $('#lottery-start').bind('click', function () {
        $('#lottery-start').unbind('click');
        $('.drawbtn').addClass('disable-btn disabled');
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
                        $('#lottery-start').removeClass('disable-btn disabled');
                        $('#close-modal').unbind('click');
                    });
                }
                $('#prize-info').modal('show');
            }
        })
    });

    $('#feedback-text').bind('click', function () {
        $('#feedback-text').addClass('hide');
        $('#feedback').find('.input-group').removeClass('hide');
        $('#feedback-check-btn').bind('click', function () {
            var feedback = $('#feedback').find('.form-control').val();
            if (feedback) {
                $('#feedback-check-btn').html('<i class="fa fa-spinner fa-spin fa-fw"></i>');
                $('#feedback').find('.form-control').attr('disabled', 'disabled');
                $.ajax({
                    type: 'POST',
                    url: '/lottery/feedback',
                    // url: 'http://localhost:4000/lottery/feedback',
                    data: {
                       'feedback': feedback
                    },
                    dataType: "json",
                    ContentType: "application/x-www-form-urlencoded",
                    success: function (data) {
                        if (0 == data['code']) {
                            $('#feedback-check-btn').html('<i class="fa fa-check" aria-hidden="true"></i>');
                            $('#feedback-check-btn').attr('disabled', 'disabled');
                            $('#feedback-check-btn').unbind('click');
                        }
                    }
                });
            }
        });
    });
});