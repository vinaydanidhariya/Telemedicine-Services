"use strict";
let isDarkStyle = function () {
    return document.documentElement.classList.contains("dark-style")
}
!function () {
    let o, r, e, t, s, i;
    i = (false ? (o = config.colors_dark.cardColor,
        r = config.colors_dark.headingColor,
        e = config.colors_dark.bodyColor,
        t = config.colors_dark.textMuted,
        config.colors_dark) : (o = config.colors.cardColor,
            r = config.colors.headingColor,
            e = config.colors.bodyColor,
            t = config.colors.textMuted,
            config.colors)).borderColor;
    var a = document.querySelector("#orderChart")
        , n = {
            chart: {
                height: 80,
                type: "area",
                toolbar: {
                    show: !1
                },
                sparkline: {
                    enabled: !0
                }
            },
            markers: {
                size: 6,
                colors: "transparent",
                strokeColors: "transparent",
                strokeWidth: 4,
                discrete: [{
                    fillColor: config.colors.white,
                    seriesIndex: 0,
                    dataPointIndex: 6,
                    strokeColor: config.colors.success,
                    strokeWidth: 2,
                    size: 6,
                    radius: 8
                }],
                hover: {
                    size: 7
                }
            },
            grid: {
                show: !1,
                padding: {
                    right: 8
                }
            },
            colors: [config.colors.success],
            fill: {
                type: "gradient",
                gradient: {
                    shade: s,
                    shadeIntensity: .8,
                    opacityFrom: .8,
                    opacityTo: .25,
                    stops: [0, 85, 100]
                }
            },
            dataLabels: {
                enabled: !1
            },
            stroke: {
                width: 2,
                curve: "smooth"
            },
            series: [{
                data: [180, 175, 275, 140, 205, 190, 295]
            }],
            xaxis: {
                show: !1,
                lines: {
                    show: !1
                },
                labels: {
                    show: !1
                },
                stroke: {
                    width: 0
                },
                axisBorder: {
                    show: !1
                }
            },
            yaxis: {
                stroke: {
                    width: 0
                },
                show: !1
            }
        }
        , a = (null !== a && new ApexCharts(a, n).render(),
            document.querySelector("#totalRevenueChart"))
        , n = {
            series: [{
                name: "2021",
                data: [18, 7, 15, 29, 18, 12, 9]
            }, {
                name: "2020",
                data: [-13, -18, -9, -14, -5, -17, -15]
            }],
            chart: {
                height: 300,
                stacked: !0,
                type: "bar",
                toolbar: {
                    show: !1
                }
            },
            plotOptions: {
                bar: {
                    horizontal: !1,
                    columnWidth: "33%",
                    borderRadius: 12,
                    startingShape: "rounded",
                    endingShape: "rounded"
                }
            },
            colors: [config.colors.primary, config.colors.info],
            dataLabels: {
                enabled: !1
            },
            stroke: {
                curve: "smooth",
                width: 6,
                lineCap: "round",
                colors: [o]
            },
            legend: {
                show: !0,
                horizontalAlign: "left",
                position: "top",
                markers: {
                    height: 8,
                    width: 8,
                    radius: 12,
                    offsetX: -3
                },
                labels: {
                    colors: e
                },
                itemMargin: {
                    horizontal: 10
                }
            },
            grid: {
                borderColor: i,
                padding: {
                    top: 0,
                    bottom: -8,
                    left: 20,
                    right: 20
                }
            },
            xaxis: {
                categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
                labels: {
                    style: {
                        fontSize: "13px",
                        colors: t
                    }
                },
                axisTicks: {
                    show: !1
                },
                axisBorder: {
                    show: !1
                }
            },
            yaxis: {
                labels: {
                    style: {
                        fontSize: "13px",
                        colors: t
                    }
                }
            },
            responsive: [{
                breakpoint: 1700,
                options: {
                    plotOptions: {
                        bar: {
                            borderRadius: 10,
                            columnWidth: "32%"
                        }
                    }
                }
            }, {
                breakpoint: 1580,
                options: {
                    plotOptions: {
                        bar: {
                            borderRadius: 10,
                            columnWidth: "35%"
                        }
                    }
                }
            }, {
                breakpoint: 1440,
                options: {
                    plotOptions: {
                        bar: {
                            borderRadius: 10,
                            columnWidth: "42%"
                        }
                    }
                }
            }, {
                breakpoint: 1300,
                options: {
                    plotOptions: {
                        bar: {
                            borderRadius: 10,
                            columnWidth: "48%"
                        }
                    }
                }
            }, {
                breakpoint: 1200,
                options: {
                    plotOptions: {
                        bar: {
                            borderRadius: 10,
                            columnWidth: "40%"
                        }
                    }
                }
            }, {
                breakpoint: 1040,
                options: {
                    plotOptions: {
                        bar: {
                            borderRadius: 11,
                            columnWidth: "48%"
                        }
                    }
                }
            }, {
                breakpoint: 991,
                options: {
                    plotOptions: {
                        bar: {
                            borderRadius: 10,
                            columnWidth: "30%"
                        }
                    }
                }
            }, {
                breakpoint: 840,
                options: {
                    plotOptions: {
                        bar: {
                            borderRadius: 10,
                            columnWidth: "35%"
                        }
                    }
                }
            }, {
                breakpoint: 768,
                options: {
                    plotOptions: {
                        bar: {
                            borderRadius: 10,
                            columnWidth: "28%"
                        }
                    }
                }
            }, {
                breakpoint: 640,
                options: {
                    plotOptions: {
                        bar: {
                            borderRadius: 10,
                            columnWidth: "32%"
                        }
                    }
                }
            }, {
                breakpoint: 576,
                options: {
                    plotOptions: {
                        bar: {
                            borderRadius: 10,
                            columnWidth: "37%"
                        }
                    }
                }
            }, {
                breakpoint: 480,
                options: {
                    plotOptions: {
                        bar: {
                            borderRadius: 10,
                            columnWidth: "45%"
                        }
                    }
                }
            }, {
                breakpoint: 420,
                options: {
                    plotOptions: {
                        bar: {
                            borderRadius: 10,
                            columnWidth: "52%"
                        }
                    }
                }
            }, {
                breakpoint: 380,
                options: {
                    plotOptions: {
                        bar: {
                            borderRadius: 10,
                            columnWidth: "60%"
                        }
                    }
                }
            }],
            states: {
                hover: {
                    filter: {
                        type: "none"
                    }
                },
                active: {
                    filter: {
                        type: "none"
                    }
                }
            }
        }
        , a = (null !== a && new ApexCharts(a, n).render(),
            document.querySelector("#growthChart"))
        , n = {
            series: [78],
            labels: ["Growth"],
            chart: {
                height: 240,
                type: "radialBar"
            },
            plotOptions: {
                radialBar: {
                    size: 150,
                    offsetY: 10,
                    startAngle: -150,
                    endAngle: 150,
                    hollow: {
                        size: "55%"
                    },
                    track: {
                        background: o,
                        strokeWidth: "100%"
                    },
                    dataLabels: {
                        name: {
                            offsetY: 15,
                            color: e,
                            fontSize: "15px",
                            fontWeight: "600",
                            fontFamily: "Public Sans"
                        },
                        value: {
                            offsetY: -25,
                            color: r,
                            fontSize: "22px",
                            fontWeight: "500",
                            fontFamily: "Public Sans"
                        }
                    }
                }
            },
            colors: [config.colors.primary],
            fill: {
                type: "gradient",
                gradient: {
                    shade: "dark",
                    shadeIntensity: .5,
                    gradientToColors: [config.colors.primary],
                    inverseColors: !0,
                    opacityFrom: 1,
                    opacityTo: .6,
                    stops: [30, 70, 100]
                }
            },
            stroke: {
                dashArray: 5
            },
            grid: {
                padding: {
                    top: -35,
                    bottom: -10
                }
            },
            states: {
                hover: {
                    filter: {
                        type: "none"
                    }
                },
                active: {
                    filter: {
                        type: "none"
                    }
                }
            }
        }
        , a = (null !== a && new ApexCharts(a, n).render(),
            document.querySelector("#revenueChart"))
        , n = {
            chart: {
                height: 80,
                type: "bar",
                toolbar: {
                    show: !1
                }
            },
            plotOptions: {
                bar: {
                    barHeight: "80%",
                    columnWidth: "75%",
                    startingShape: "rounded",
                    endingShape: "rounded",
                    borderRadius: 2,
                    distributed: !0
                }
            },
            grid: {
                show: !1,
                padding: {
                    top: -20,
                    bottom: -12,
                    left: -10,
                    right: 0
                }
            },
            colors: [config.colors_label.primary, config.colors_label.primary, config.colors_label.primary, config.colors_label.primary, config.colors.primary, config.colors_label.primary, config.colors_label.primary],
            dataLabels: {
                enabled: !1
            },
            series: [{
                data: [40, 95, 60, 45, 90, 50, 75]
            }],
            legend: {
                show: !1
            },
            xaxis: {
                categories: ["M", "T", "W", "T", "F", "S", "S"],
                axisBorder: {
                    show: !1
                },
                axisTicks: {
                    show: !1
                },
                labels: {
                    style: {
                        colors: t,
                        fontSize: "13px"
                    }
                }
            },
            yaxis: {
                labels: {
                    show: !1
                }
            }
        }
        // , a = (null !== a && new ApexCharts(a, n).render(),
        //     document.querySelector("#profileReportChart"))
        // , n = {
        //     chart: {
        //         height: 80,
        //         type: "line",
        //         toolbar: {
        //             show: !1
        //         },
        //         dropShadow: {
        //             enabled: !0,
        //             top: 10,
        //             left: 5,
        //             blur: 3,
        //             color: config.colors.warning,
        //             opacity: .15
        //         },
        //         sparkline: {
        //             enabled: !0
        //         }
        //     },
        //     grid: {
        //         show: !1,
        //         padding: {
        //             right: 8
        //         }
        //     },
        //     colors: [config.colors.warning],
        //     dataLabels: {
        //         enabled: !1
        //     },
        //     stroke: {
        //         width: 5,
        //         curve: "smooth"
        //     },
        //     series: [{
        //         data: [110, 270, 145, 245, 205, 285]
        //     }],
        //     xaxis: {
        //         show: !1,
        //         lines: {
        //             show: !1
        //         },
        //         labels: {
        //             show: !1
        //         },
        //         axisBorder: {
        //             show: !1
        //         }
        //     },
        //     yaxis: {
        //         show: !1
        //     }
        // }
        , a = (null !== a && new ApexCharts(a, n).render(),
            document.querySelector("#orderStatisticsChart"))
        , n = {
            chart: {
                height: 165,
                width: 130,
                type: "donut"
            },
            labels: ["Electronic", "Sports", "Decor", "Fashion"],
            series: [85, 15, 50, 50],
            colors: [config.colors.primary, config.colors.secondary, config.colors.info, config.colors.success],
            stroke: {
                width: 5,
                colors: o
            },
            dataLabels: {
                enabled: !1,
                formatter: function (o, r) {
                    return parseInt(o) + "%"
                }
            },
            legend: {
                show: !1
            },
            grid: {
                padding: {
                    top: 0,
                    bottom: 0,
                    right: 15
                }
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: "75%",
                        labels: {
                            show: !0,
                            value: {
                                fontSize: "1.5rem",
                                fontFamily: "Public Sans",
                                color: r,
                                offsetY: -15,
                                formatter: function (o) {
                                    return parseInt(o) + "%"
                                }
                            },
                            name: {
                                offsetY: 20,
                                fontFamily: "Public Sans"
                            },
                            total: {
                                show: !0,
                                fontSize: "0.8125rem",
                                color: e,
                                label: "Weekly",
                                formatter: function (o) {
                                    return "38%"
                                }
                            }
                        }
                    }
                }
            }
        }
        , a = (null !== a && new ApexCharts(a, n).render(),
            document.querySelector("#incomeChart"))
        , n = {
            series: [{
                data: [24, 21, 30, 22, 42, 26, 35, 29]
            }],
            chart: {
                height: 350,
                parentHeightOffset: 0,
                parentWidthOffset: 0,
                toolbar: {
                    show: !1
                },
                type: "area"
            },
            dataLabels: {
                enabled: !1
            },
            stroke: {
                width: 2,
                curve: "smooth"
            },
            legend: {
                show: !1
            },
            markers: {
                size: 6,
                colors: "transparent",
                strokeColors: "transparent",
                strokeWidth: 4,
                discrete: [{
                    fillColor: config.colors.white,
                    seriesIndex: 0,
                    dataPointIndex: 7,
                    strokeColor: config.colors.primary,
                    strokeWidth: 2,
                    size: 6,
                    radius: 8
                }],
                hover: {
                    size: 7
                }
            },
            colors: [config.colors.primary],
            fill: {
                type: "gradient",
                gradient: {
                    shade: s,
                    shadeIntensity: .6,
                    opacityFrom: .5,
                    opacityTo: .25,
                    stops: [0, 95, 100]
                }
            },
            grid: {
                borderColor: i,
                strokeDashArray: 3,
                padding: {
                    top: -20,
                    bottom: -8,
                    left: -10,
                    right: 8
                }
            },
            xaxis: {
                categories: ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
                axisBorder: {
                    show: !1
                },
                axisTicks: {
                    show: !1
                },
                labels: {
                    show: !0,
                    style: {
                        fontSize: "13px",
                        colors: t
                    }
                }
            },
            yaxis: {
                labels: {
                    show: !1
                },
                min: 10,
                max: 50,
                tickAmount: 4
            }
        }
        , a = (null !== a && new ApexCharts(a, n).render(),
            document.querySelector("#expensesOfWeek"))
        , n = {
            series: [65],
            chart: {
                width: 60,
                height: 60,
                type: "radialBar"
            },
            plotOptions: {
                radialBar: {
                    startAngle: 0,
                    endAngle: 360,
                    strokeWidth: "8",
                    hollow: {
                        margin: 2,
                        size: "45%"
                    },
                    track: {
                        strokeWidth: "50%",
                        background: i
                    },
                    dataLabels: {
                        show: !0,
                        name: {
                            show: !1
                        },
                        value: {
                            formatter: function (o) {
                                return "$" + parseInt(o)
                            },
                            offsetY: 5,
                            color: "#697a8d",
                            fontSize: "13px",
                            show: !0
                        }
                    }
                }
            },
            fill: {
                type: "solid",
                colors: config.colors.primary
            },
            stroke: {
                lineCap: "round"
            },
            grid: {
                padding: {
                    top: -10,
                    bottom: -15,
                    left: -10,
                    right: -10
                }
            },
            states: {
                hover: {
                    filter: {
                        type: "none"
                    }
                },
                active: {
                    filter: {
                        type: "none"
                    }
                }
            }
        };
    null !== a && new ApexCharts(a, n).render()

    // Define the URL of your API endpoint.
    const apiUrl = '/doctor-analytics/month-revenue';
    const monthAmount =document.querySelector(".month-revenue-amount");
    const presentMonthYear =document.querySelector(".present_month_year");

    // Fetch data from the API.
    fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
            monthAmount.textContent = data.totalPaymentAmount;
            presentMonthYear.textContent = data.currentMonth;
            const chartConfig = {
                chart: {
                    height: 80,
                    type: "line",
                    toolbar: {
                        show: !1
                    },
                    dropShadow: {
                        enabled: !0,
                        top: 10,
                        left: 5,
                        blur: 3,
                        color: config.colors.warning,
                        opacity: .15
                    },
                    sparkline: {    
                        enabled: !0
                    }
                },
                grid: {
                    show: !1,
                    padding: {
                        right: 8
                    }
                },
                colors: [config.colors.warning],
                dataLabels: {
                    enabled: !1
                },
                stroke: {
                    width: 5,
                    curve: "smooth"
                },
                series: [{
                    data: data.transactionCounts 
                }],
                xaxis: {
                    show: !1,
                    lines: {
                        show: !1
                    },
                    labels: {
                        show: !1
                    },
                    axisBorder: {
                        show: !1
                    }
                },
                yaxis: {
                    show: !1
                }
            };

            // Render the chart with the dynamic configuration.
            const profileReportChart = document.querySelector("#profileReportChart");
            if (profileReportChart) {
                new ApexCharts(profileReportChart, chartConfig).render();
            }
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
        });

}();












