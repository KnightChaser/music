// src/assets/js/worldMap.js

export function createMap(containerId, data) {
  if (!Highcharts || !Highcharts.maps["custom/world"]) {
    console.error("Highcharts or world map data not loaded.");
    return;
  }

  const counts = data.map(([, value]) => value);
  const dataMax = counts.length ? Math.max(...counts) : 1;

  Highcharts.mapChart(containerId, {
    chart: { map: "custom/world", backgroundColor: "#f9fafb", height: 600 },
    title: { text: "Geographic Distribution of Artists in My Playlist" },
    subtitle: {
      text: "Color intensity indicates number of songs in the playlist",
    },
    mapNavigation: {
      enabled: true,
      buttonOptions: { verticalAlign: "bottom" },
    },

    colorAxis: {
      min: 1,
      max: dataMax,
      type: "logarithmic",
      minColor: "#28B8D5",
      maxColor: "#18230F",
      stops: [
        [0, "#28B8D5"],
        [0.67, "#0F3F74"],
        [1, "#020344"],
      ],
    },

    series: [
      {
        data,
        name: "Songs",
        joinBy: ["hc-key", 0],
        states: { hover: { color: "#B22222" } },
        tooltip: { valueSuffix: " songs" },
      },
    ],
  });
}
