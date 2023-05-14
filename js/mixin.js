export default {
    data() {
        return {
            userPhone: '',
            // orderId: null,
            //验证码
            verifyCode: '',
            showCodeFide: false,
            canClick: true,
            totalTime: 60,
            btnGetCode: '获取验证码',
            //底部浮动按钮
            //showFlotBtn:false

            //1头条 2推啊 3广点通
            launchChanne: 1,

            //2、omg的打点 需要上报的参数配置
            // channelNo: '',
            // cookie: '',
            // androidId: '',
            // packageName: '',
            // pageId: '',
            // sid: '',

            //提交验证码成功
            //changeUrl:'',//跳转的兑换链接
            //clickToChange: false,//如果未undefined类型则直接跳转changeUrl，boolean类型则手动点击触发跳转changeUrl
            //successMsg:''//没有兑换链接则只需页面提示，不设置提示则用默认提示

            //隐私协议
            //checked:true,//同意隐私协议
            //checkedTips:'',//没有勾选同意隐私协议时的提示语
        };
    },

    mounted() {
        // 获取channelId
		let channelId = opt.getUrlParam('channelid');
        if (channelId) {
            this.channelId = channelId;
        }

        // 获取orderId
        // var orderId = '';
        if (opt.getUrlParam('a_oId')) {
            this.orderId = opt.getUrlParam('a_oId');
        } else if (opt.getUrlParam('clickid')) {
            this.orderId = opt.getUrlParam('clickid');
        }

        // get ipaddress
        // let ipAddress = sessionStorage.getItem("ipAddress");
        // this.ipAddress = ipAddress;
        // console.log(ipAddress);
        // this.userPhone = opt.getUrlParam('pa');
	    
	if (window.history && window.history.pushState) {
            console.log(document.URL);
//             alert("change: " + document.URL)
            history.pushState(null, null, document.URL);
            window.addEventListener("popstate", this.goBack, false);
          }
       
    },
    destroyed() {
        window.removeEventListener("popstate", this.goBack, false);
    },
    methods: {
	goBack() {
            this.$router.replace({path:'https://m.aibangbaoxian.net/wxAppBusiness?shuntCode=AB2023011301'}); //退回到h5首页，避免返回来回死循环跳转，建议使用this.$router.replace(),跳转到指定url路径，但是history栈中不会有记录，点击返回不会跳转到上个页面。
         },
        //监听页面滚动 滚动>=500显示底部按钮
        handelScroll() {
            let scrolltop = document.getElementById('app').scrollTop;
            let flotBtn = document.getElementsByClassName('float-btn');
            if (scrolltop >= 500) {
                this.showFlotBtn = true;
            } else {
                this.showFlotBtn = false;
            }
        },

        //监听手机号输入框，完整输入则创建订单
        vertifyInput(val) {
            this.verifyCode = '';
            if (opt.verifyMbl(val)) {
                this.createOrder();
                if (typeof this.checked == 'boolean') {
                    this.checked = true;
                }
            } else {
                this.showCodeFide = false;
                window.clearInterval(this.clock());
            }
        },

        //创建订单
        createOrder() {
            var flagMobile = opt.verifyMbl(this.userPhone);

            if (!flagMobile) {
                vant.Toast({
                    message: '请正确输入手机号码！',
                    position: 'bottom',
                });
                this.$refs.topUserPhone.focus();
                return;
            }
          
            let params = {
                "ipaddress": '1.192.156.201',	//固定值
                // "ipaddress": this.ipAddress,
                "ver": '1.0',	//固定值
                "mobile": this.userPhone,
                // "channel": '2039061001',	//测试渠道号
                "channel": this.channelId,
                "imsi": '460030870900577',	//固定值
                "imei": '354779069340660',	//固定值
                "phoneModel": 'MI+4LTE',	//固定值
                "apName": 'shipinhuiyuan',	//固定值
                "appName": 'doudizhu',	//固定值
                "chargeName": '10beika',	//固定值
                "price": 1000,	//测试值，deploy后重置
                "chargeType": 2,	//固定值
                "timestamp": new Date().getTime(),
                "orderId": this.orderId,	//来自跳转页面url的参数：a_oId 或 clickid
                "sig": 'test'	//固定值
            };

            typeof _czc != 'undefined' &&
                _czc.push(['_trackEvent', '创建订单', '点击']);

            opt.ajaxPromise({
                url: api.create,
                param: params,
                // hideloading: this.errorUrl ? true : false,
            }).then((res) => {
                if (res.resultCode == 0) {
                    vant.Toast.success('验证码已下发!');
                    this.showCodeFide = true;
                    // this.orderId = res.orderId;
                    this.pid = res.pid;

                    window.clearInterval(this.clock());
                    this.totalTime = 60;
                    this.btnGetCode = '获取验证码';
                    this.countDown();

                    typeof _czc != 'undefined' &&
                        _czc.push([
                            '_trackEvent',
                            '成功创建订单并下发验证码',
                            '接口请求成功',
                        ]);
                } else {
                    if (this.rebackUrl) {
                        vant.Toast({
                            message: '亲，您的号码暂无法办理，正为您推荐其他优惠产品',
                            position: 'top',
                            duration: 2000,
                            className: 'toastWidth'
                        });
                        setTimeout(() => {
                            window.location.href = this.rebackUrl;
                        }, 2000)
                    } else {
                        vant.Toast.fail({
                            icon: 'cross',
                            message: res.resultDesc,
                        });
                    }
                }
            });
        },

        errLOOP() {
            //提示勾选同意隐私协议
            if (this.checkedTips && !this.checked) {
                vant.Toast({
                    message: this.checkedTips,
                    position: 'bottom',
                });
                return;
            }
            const toast = vant.Toast.loading({
                duration: 0, // 持续展示 toast
                forbidClick: true,
                message: '业务处理中，倒计时 6 秒',
            });

            let second = 6;
            const timer = setInterval(() => {
                second--;
                if (second) {
                    toast.message = `业务处理中，倒计时 ${second} 秒`;
                } else {
                    clearInterval(timer);
                    vant.Toast.clear();
                    // 手动清除 Toast
                    // this.showErrorPopup = true;
                }
            }, 1000);
        },

        //提交验证码
        validateUpLevel(cb) {

            if (!opt.verifyRule()) {
                vant.Toast({
                    message: '请勾选并同意协议及相关资费',
                    position: 'bottom',
                });
                this.$refs.topUserPhone.focus();
                return;
            }

            if (!opt.verifyMbl(this.userPhone)) {
                vant.Toast({
                    message: '请正确输入手机号码！',
                    position: 'bottom',
                });
                this.$refs.topUserPhone.focus();
                return;
            }

            if (!this.showCodeFide) {
                this.createOrder();
                return;
            }

            if (!opt.verifyCode(this.verifyCode)) {
                vant.Toast({
                    message: '请正确输入验证码！',
                    position: 'bottom',
                });
                this.$refs.topUserCode.focus();
                return;
            }

            //提示勾选同意隐私协议
            if (this.checkedTips && !this.checked) {
                vant.Toast({
                    message: this.checkedTips,
                    position: 'bottom',
                });
                return;
            }

            typeof _czc != 'undefined' &&
                _czc.push(['_trackEvent', '提交验证码', '点击']);

            opt.ajaxPromise({
                url: api.validate,
                param: {
                    "verifyCode": this.verifyCode,
					"pid": this.pid,
					"orderFrom": '0',
					"sig": 'test'
                },
            }).then((res) => {
                // console.log(typeof res);	//String
                if (res.resultCode == 0) {
                    // if (res.quanyiUrl) {
                    //     this.changeUrl = res.quanyiUrl;
                    // }
                    if (cb) {
                        cb(res);
                    } else {
                        //Show success message directly
                        // vant.Toast.success({
                        //     message: '验证码提交成功!',
                        // });
                        // setTimeout(() => {
                        //     this.workDealing();
                        // }, 1500);
                        vant.Toast.success({
                            duration: 3000,
                            message: this.successMsg
                                ? this.successMsg
                                : '订购成功!',
                        });
                        typeof _czc != 'undefined' &&
                            _czc.push([
                                '_trackEvent',
                                '提交验证码成功',
                                '接口请求成功',
                            ]);
                    }
                } else {
                    vant.Toast.fail({
                        icon: 'cross',
                        message: res.resultDesc,
                    });
                }
            });
        },

        workDealing() {
            typeof countLog != 'undefined' &&
                this.launchChanne == 2 &&
                this.countLog();
            const toast = vant.Toast.loading({
                duration: 0, // 持续展示 toast
                forbidClick: true,
                message: '业务处理中，倒计时 6 秒',
            });

            let second = 6;
            const timer = setInterval(() => {
                second--;
                if (second) {
                    toast.message = `业务处理中，倒计时 ${second} 秒`;
                } else {
                    clearInterval(timer);
                    // 手动清除 Toast
                    this.resetPage();
                    if (this.changeUrl) {
                        if (typeof this.clickToChange == 'undefined') {
                            this.toChange();
                        } else {
                            this.clickToChange = true;
                        }
                    } else {
                        if (typeof this.clickToChange == 'boolean') {
                            this.clickToChange = true;
                        } else {
                            vant.Toast.success({
                                duration: 5000,
                                message: this.successMsg
                                    ? this.successMsg
                                    : '订购成功!',
                            });
                        }
                    }
                }
            }, 1000);
        },

        toChange() {
            window.location.href = this.changeUrl;
            typeof _czc != 'undefined' &&
                _czc.push([
                    '_trackEvent',
                    '跳转权益页面',
                    '提交验证码成功后跳转' + this.changeUrl,
                ]);
        },

        //change to 3rd part link when close login dialog
        changeLink() {
            window.location.href = "https://m.aibangbaoxian.net/wxAppBusiness?shuntCode=AB2023011301";
        },


        //倒计时
        countDown() {
            if (!this.canClick) {
                return;
            }
            this.canClick = false;
            this.btnGetCode = this.totalTime + 's后重发';
            this.clock();
        },

        clock() {
            let clock = setInterval(() => {
                this.totalTime--;
                this.btnGetCode = this.totalTime + 's后重发';
                if (this.totalTime < 0) {
                    window.clearInterval(clock);
                    this.btnGetCode = '获取验证码';
                    this.totalTime = 60;
                    this.canClick = true;
                }
            }, 1000);
            return clock;
        },

        //点击获取验证码（在倒计时结束后才能点击） 触发创建订单
        getVertifyCode() {
            if (!this.canClick) {
                return;
            }
            this.createOrder();
        },

        resetPage() {
            vant.Toast.clear();
            this.userPhone = '';
            this.verifyCode = '';
            this.showCodeFide = false;
            window.clearInterval(this.clock());
            this.canClick = true;
        },

        //获取cookie
        getCookie() {
            let usercookie = '';
            let cookieAry = document.cookie.split(';');
            for (var i in cookieAry) {
                if (cookieAry[i].indexOf('userName=') != -1) {
                    usercookie = cookieAry[i].split('userName=')[1];
                    break;
                }
            }
            return usercookie;
        },

        //判断cookie
        checkCookie() {
            let usercookie = this.getCookie();
            if (!usercookie) {
                let exp = new Date().getTime(); //获得当前时间
                let rdom = Math.floor(Math.random() * 900) + 100;
                this.cookie = exp + '' + rdom;
                document.cookie = 'userName=' + exp + '' + rdom;
            } else {
                this.cookie = usercookie;
            }
        },

    },
};
