document.addEventListener("DOMContentLoaded", function () {

    /*
        Smooth scrolling for Home page sections
    */

    const navigationLinks =
        document.querySelectorAll('a[href^="#"]');


    navigationLinks.forEach(function (link) {

        link.addEventListener("click", function (event) {

            const targetId =
                this.getAttribute("href");


            if (targetId === "#") {
                return;
            }


            const target =
                document.querySelector(targetId);


            if (target) {

                event.preventDefault();


                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

    });


    /*
        Dashboard chart interaction

        Every bar starts neutral.
        The bar currently being hovered/touched
        becomes blue through CSS.
    */

    const chartBars =
        document.querySelectorAll(".chart-bars i");


    chartBars.forEach(function (bar) {

        bar.addEventListener("click", function () {

            chartBars.forEach(function (item) {
                item.classList.remove("selected");
            });


            this.classList.add("selected");

        });

    });

});