//  We really need a proper loading script like scriptaculous

//document.write('<script type="text/javascript" src="/js/combo.packed.js"></script>');
document.write('<script type="text/javascript" src="js/bse-admin/dropmenu.js"></script>');
document.write('<script type="text/javascript" src="js/bse-admin/opendetails.js"></script>');
document.write('<script type="text/javascript" src="js/bse-admin/form-monitor.js"></script>');

// wait for DOM to load before initialising

document.observe("dom:loaded", dom_init);
//Event.observe(window, "load", window_init);

function dom_init() {

    var message = $('message');
    
    if (message != undefined) {
        new Effect.Pulsate(message, {
            delay: 2
        });
    
        message.observe('click', function() {
            new Effect.SlideUp(this);
       });
    };

    var menu = new DropMenu('.menu li', {
        showLeft: null,
        effects: {
            show: [ Effect.Appear ],
            hide: [ Effect.Fade ],
            showDuration: 0.1,
            hideDuration: 0.5,
            transition: Effect.Transitions.linear
        },
        showDelay: 0.2,
        hideDelay: 0.5,
        osMode: true,
        rootItems: '.menu > li'
    });

    var openDetails = OpenDetails();

    fixIeFields();

    // $$("[data-object]:not([data-object=placeholder])").each(function(element) {
    //     element.observe('click', function(event) {
    //         var element = event.element();
    //         var message = element.getAttribute("data-confirm");
    //         var object = element.getAttribute("data-object");


    //         $("lightbox").setStyle({display: "block"});
    //         $$("#lightbox [data-object=placeholder]").invoke('update', object);
            
    //         if(message) {
    //             $("confirmMessage").update(message);
    //         }
    //         $("confirmDelete").setAttribute("href", element.href);
    //         $("confirmCancel").observe('click', function(event) {
    //             $("lightbox").hide();
    //             event.stopPropagation();
    //             event.preventDefault();
    //         });
            
    //         event.stopPropagation();
    //         event.preventDefault();
    //     });
    // });

    // $$("input[type=submit]").each(function(element) {
    //     var submit = element;
    //     var form = element.up("form");
    //     var inputs = form.getElements(":not([type=hidden])");

    //     submit.disable();
        
    //     inputs.each(function(input) {
    //         input.observe("change", function() {
    //             submit.enable();
    //         });
    //     });
    // });
    var form_mon = new ChangeMonitor();

};

function window_init() {
};

function fixIeFields() {
    var isIE = navigator.userAgent.indexOf("MSIE") > -1;
    if(!isIE) return;

    var normalWidthFields = $$("div.window fieldset input:not([type=submit]):not([type=checkbox]):not([type=radio]), div.window fieldset select, div.window fieldset textarea");
    var fullWidthFields = $$("div.window fieldset div.full input:not([type=submit]):not([type=checkbox]):not([type=radio]), div.dialog fieldset input:not([type=submit]):not([type=checkbox]):not([type=radio]), div.window fieldset div.full select, div.window fieldset div.full textarea, div.dialog fieldset select, div.dialog fieldset textarea");

    normalWidthFields.each(function(element) {
        element.setStyle({width: "40%"});
    });

    fullWidthFields.each(function(element) {
        element.setStyle({width: "100%"});
    });

};