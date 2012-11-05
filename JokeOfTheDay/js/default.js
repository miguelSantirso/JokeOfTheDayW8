// For an introduction to the Fixed Layout template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232508
(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;

    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                //
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }
            args.setPromise(WinJS.UI.processAll());

            registerForShare();
            bindShareButton();
            refreshUI();
        }
    };
    
    Windows.UI.WebUI.WebUIApplication.onresuming = function () {
        refreshUI();
    };

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. You might use the
        // WinJS.Application.sessionState object, which is automatically
        // saved and restored across suspension. If you need to complete an
        // asynchronous operation before your application is suspended, call
        // args.setPromise().
    };

    app.onloaded = function () {
        WinJS.Resources.processAll();
    };


    function refreshUI() {
        setDate();
        setJokeOfDay();
        setLiveTile();
    };

    function bindShareButton() {
        var shareButton = document.getElementById("share");
        shareButton.addEventListener("click", function (event) { Windows.ApplicationModel.DataTransfer.DataTransferManager.showShareUI(); }, false);
    };

    function setDate() {
        var dateFormatter = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("longdate");
        var formattedDate = dateFormatter.format(new Date());

        var theDate = document.getElementById("date");
        theDate.textContent = formattedDate;
    };

    function setJokeOfDay() {
        var theJoke = document.getElementById("theJoke");
        theJoke.textContent = getTodaysJoke();
    };


    function getTodaysJoke() {
        var nJokes = getString("/jokes/nJokes");
        var today = Math.floor(new Date().getTime() / (24 * 60 * 60 * 1000));

        var todaysJokeI18NKey = "/jokes/joke" + today % nJokes;

        return getString(todaysJokeI18NKey);
    };


    function registerForShare() {
        var dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
        dataTransferManager.addEventListener("datarequested", shareTextHandler);
    };

    function shareTextHandler(e) {
        var request = e.request;
        request.data.properties.title = getString("sharePaneTitle");
        request.data.properties.description = getString("sharePaneDescription");
        request.data.setText(getTodaysJoke());
    };


    function setLiveTile() {
        var notifications = Windows.UI.Notifications;

        var template = notifications.TileTemplateType.tileWideText04;
        var tileXml = notifications.TileUpdateManager.getTemplateContent(template);

        var tileTextAttributes = tileXml.getElementsByTagName("text");
        tileTextAttributes[0].appendChild(tileXml.createTextNode(getTodaysJoke()));

        var squareTemplate = notifications.TileTemplateType.tileSquareText04;
        var squareTileXml = notifications.TileUpdateManager.getTemplateContent(squareTemplate);
        var squareTileTextAttributes = squareTileXml.getElementsByTagName("text");
        squareTileTextAttributes[0].appendChild(squareTileXml.createTextNode(getTodaysJoke()));

        var node = tileXml.importNode(squareTileXml.getElementsByTagName("binding").item(0), true);
        tileXml.getElementsByTagName("visual").item(0).appendChild(node);

        var tileNotification = new notifications.TileNotification(tileXml);

        var currentTime = new Date();
        tileNotification.expirationTime = new Date(currentTime.getTime() + 600 * 1000);

        notifications.TileUpdateManager.createTileUpdaterForApplication().update(tileNotification);
    };


    function getString(i18nKey) {
        return WinJS.Resources.getString(i18nKey).value;
    };


    app.start();
})();
