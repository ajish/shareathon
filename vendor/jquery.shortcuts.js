(function($) {
    
    // IE has problems overriding toString in object prototypes, see
    // http://webreflection.blogspot.com/2007/07/quick-fix-internet-explorer-and.html
    // so we'll define the function here and assing it in constructor
    function keyToStringFunc() {
        var result = Key.codes[this.code];
        if (!result && (this.isNumber() || this.isAlpha())) result = String.fromCharCode(this.code);
        if (!result) result = null;
        return result;
    }
    
    function Key(keyDownEvent) {
        this.code = keyDownEvent.which || keyDownEvent.keyCode;
        this.toString = keyToStringFunc;
    };
    
    $.extend(Key,{
        codes: {
            8: 'Backspace',
            46: 'Del',
            
            112: 'F1', 113: 'F2',
            114: 'F3', 115: 'F4',
            116: 'F5', 117: 'F6',
            118: 'F7', 119: 'F8',
            120: 'F9', 121: 'F10',
            122: 'F11', 123: 'F12',
            
            106: '*', 111: '/',
            186: ';', 187: '+',
            188: ',', 189: '-',
            190: '.', 191: '/',
            192: '`', 219: '[',
            220: '\\', 221: ']',
            222: '\''
            
        },
        modifierCodes: [
            16, // shift
            17, // ctrl
            18, // alt
            224, // cmd
            91, // win
            92
        ],
        metaName: (function() {
            var ua = navigator.userAgent.toLowerCase();
            if (ua.indexOf('win') != -1) {
                return 'Win';
            } else if (ua.indexOf('mac') != -1) {
                return '⌘';
            } else {
                return 'Meta';
            }
        })()
    });
    
    $.extend(Key.prototype,{
        isAlpha: function() {
            return (this.code >= 65 && this.code <= 90);
        },
        isNumber: function() {
            return (this.code >= 48 && this.code <= 57);
        },
        isKnown: function() {
            return (this.isNumber() || this.isAlpha() || Key.codes[this.code]);
        },
        isModifier: function() {
            return ($.inArray(this.code,Key.modifierCodes) != -1);
        }
    });
    
    // See the comment for keyToStringFunc
    function shortcutToStringFunc() {
        var result = [];
        if (this.meta) result.push(Key.metaName);
        if (this.ctrl) result.push('Ctrl');
        if (this.alt) result.push('Alt');
        if (this.shift) result.push('Shift');
        if (this.key.isKnown()) result.push(this.key.toString());
        return result.join('+');
    }
    
    
    function Shortcut(keyDownEvent) {
        this.shift = keyDownEvent.shiftKey;
        this.ctrl = keyDownEvent.ctrlKey;
        this.meta = keyDownEvent.metaKey;
        this.alt = keyDownEvent.altKey;
        this.key = new Key(keyDownEvent);
        this.toString = shortcutToStringFunc;
    }
    
    $.extend(Shortcut.prototype,{
        isEqualToString: function(str) {
            function normalize(str) {
                return str.replace('⌘','Meta').replace('Win','Meta').toLowerCase();
            }
            return (normalize(this.toString()) == normalize(str));
        },
        isComplete: function() {
            return this.key.isKnown();
        }
    });
    
    $.fn.shortcutPicker = function(options) {
        var default_options = {'clear': ['Backspace','Del'] };
        if (options) $.extend(options, default_options);

        this.each(function() {
            $(this).bind('keydown',function(e) {
                var key = new Key(e.originalEvent);
                if (key.isKnown() && !key.isModifier()) {
                    var s = new Shortcut(e.originalEvent);
                    var value = s.toString();
                    var accept = true;
                    var new_value;
                    if (options.clear && ($.inArray(value,options.clear) != -1)) {
                        new_value = '';
                    } else {
                        if (options.onPick) {
                            accept = options.onPick.apply(this,[s]);
                        }
                        new_value = value;
                    }
                    if (accept) {
                        this.value = new_value;
                        this.blur();
                    }
                }
                e.preventDefault();
                e.stopPropagation();
            });
        });
        return this;
    };

    $.Shortcut = Shortcut;
    
    $.Event.prototype.matchesShortcut = function(str) {
        return (new Shortcut(this).isEqualToString(str));
    };
})(jQuery);