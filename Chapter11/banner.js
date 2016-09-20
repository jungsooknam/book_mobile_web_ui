window.mBanner = (function() {
    // private member
    var _htWElement = {}, 
    _htEvent = {}, 
    _htOption = {
        sPosition : "bottom",
        sPassClass : "pass_evt"
    }, 
    _bSupportFixed = false, 
    _htPosition = {}, 
    _htOldPosition = {}, 
    _sPosition = "bottom";

    // private method
    var _isSupportFixed = function() {
        var isFixed = true, 
        sOS = m.getOS(), 
        sVersion = parseInt(m.getVersion(), 10);
        if ((sOS == "iOS" && sVersion < 5 ) || (sOS == "Android" && sVersion < 3)) {
            isFixed = false;
        }
        return isFixed;
    }, 
    
    _attachEvent = function() {
        _htEvent["rotate"] = jindo.$Fn(_onReposition, this).bind();
        m.rotate.bind(_htEvent["rotate"]);
        if (!_bSupportFixed) {
            _htEvent["scroll"] = jindo.$Fn(_onScroll, this).bind();
            _htWElement["window"].attach("scroll", _htEvent["scroll"]);
        }
    },
    
    _detachEvent = function() {
        m.rotate.unbind(_htEvent["rotate"]);
        if (!_bSupportFixed) {
            _htWElement["window"].detach("scroll", _htEvent["scroll"]);
        }
    }, 
    
    _onScroll = function() {
        _setPosition();
    }, 
    
    _onReposition = function() {
        _setPosition();
    }, 
    
    _setLayer = function(sId) {
        _htWElement["element"] = jindo.$Element(sId);
        _htWElement["element"].hide();
        _htWElement["window"] = jindo.$Element(window);

        if (_bSupportFixed) {
            _htWElement["element"].css("position", "fixed");
        } else {
            _htWElement["element"].css("position", "absolute");
            if (!_htWElement["element"].parent().isEqual(document.body)) {
                _htWElement["element"].appendTo(document.body);
            }
        }
        return this;
    }, 
    
    _getPosition = function(sPosition) {
        var nLayerWidth = _htWElement["element"].width(), 
        nLayerHeight = _htWElement["element"].height(), 
        htElementPosition = {}, 
        oClientSize = jindo.$Document().clientSize(), 
        nWidth = oClientSize.width, 
        nHeight = oClientSize.height;

        // 레이어에 바깥 여백(margin)이 있을 때 렌더링 보정
        nLayerWidth += parseInt(_htWElement["element"].css('marginLeft'), 10) + parseInt(_htWElement["element"].css('marginRight'), 10) || 0;
        nLayerHeight += parseInt(_htWElement["element"].css('marginTop'), 10) + parseInt(_htWElement["element"].css('marginBottom'), 10) || 0;

        // 배너를 가운데에 보이게 하는 left 속성값을 구한다.
        htElementPosition.nLeft = parseInt((nWidth - nLayerWidth) / 2, 10);
        // 배너의 위치에 따라 top 속성값이나 bottom 속성값을 구한다.
        switch (sPosition) {
            case "top":
                htElementPosition.nTop = 0;
                break;
            case "center":
                htElementPosition.nTop = parseInt((nHeight - nLayerHeight) / 2, 10);
                break;
            case "bottom":
                if (_bSupportFixed) {
                    htElementPosition.nBottom = 0;
                } else {
                    htElementPosition.nTop = parseInt(nHeight - nLayerHeight, 10);
                }
                break;
        }
        if (!_bSupportFixed) {
            var htScrollPosition = jindo.$Document().scrollPosition();
            htElementPosition.nTop += htScrollPosition.top;
            htElementPosition.nLeft += htScrollPosition.left;
        }
        return htElementPosition;
    }, 
    
    _setPosition = function(sPosition) {
        _sPosition = sPosition || _sPosition;
        // 배너 레이어가 보이지 않게 돼 있을 경우 화면에 보이지 않는 영역으로 위치를
        // 지정한 후 배너를 보이게 한다.
        // 배너의 위치를 구했으면 다시 배너가 보이지 않게 한다.
        var bVisible = _htWElement["element"].visible();
        if (!bVisible) {
            _htWElement["element"].css({
                left : "-9999px"
            }).show();
        }
        _htOldPosition = _htPosition;
        _htPosition = _getPosition(_sPosition);
        if (!bVisible) {
            _htWElement["element"].hide();
        }

        // 기존 위치값과 현재 위치값이 다르면 변경. 그렇지 않으면 위치값을 변경하지 않음.
        // 안 보이면 무조건 변경함.
        if (!bVisible || _htOldPosition.nLeft !== _htPosition.nLeft || _htOldPosition.nTop !== _htPosition.nTop || _htOldPosition.nBottom !== _htPosition.nBottom) {
            if ( typeof _htPosition.nTop === "undefined") {
                _htWElement["element"].$value().style.top = null;
            } else if ( typeof _htPosition.nBottom === "undefined") {
                _htWElement["element"].$value().style.bottom = null;
            }
            _htWElement["element"].css({
                left : _htPosition.nLeft + "px",
                top : _htPosition.nTop + "px",
                bottom : _htPosition.nBottom + "px"
            });
        }
    };

    // 생성자
    function mBanner(sId, htOption) {
        htOption = htOption || {};
        for (var property in htOption) {
            _htOption[property] = htOption[property];
        }
        _bSupportFixed = _isSupportFixed();
        _setLayer(sId);
    }

    // public
    mBanner.prototype = {
        setPosition : _setPosition,
        show : function() {
            if (!_htWElement["element"].visible()) {
                _setPosition();
                _attachEvent();
                _htWElement["element"].show();
            }
        },
        hide : function() {
            if (_htWElement["element"].visible()) {
                _htWElement["element"].hide();
                _detachEvent();
            }
        }
    };
    return mBanner;
})();
