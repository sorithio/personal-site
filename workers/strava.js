export default {
  async fetch(request, env) {
    const tokenRes = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: env.STRAVA_CLIENT_ID,
        client_secret: env.STRAVA_CLIENT_SECRET,
        refresh_token: env.STRAVA_REFRESH_TOKEN,
        grant_type: "refresh_token"
      })
    });
    const { access_token } = await tokenRes.json();

    const actRes = await fetch("https://www.strava.com/api/v3/athlete/activities?per_page=50", {
      headers: { "Authorization": Bearer  }
    });
    const activities = await actRes.json();

    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);

    const runs = activities.filter(a => a.type === "Run");
    const ytd = runs
      .filter(a => new Date(a.start_date) >= yearStart)
      .reduce((sum, a) => sum + a.distance, 0) / 1609.344;
    const weekly = runs
      .filter(a => new Date(a.start_date) >= weekStart)
      .reduce((sum, a) => sum + a.distance, 0) / 1609.344;
    const last = runs[0];
    const lastDate = last ? last.start_date.slice(0, 10) : "n/a";
    const lastMiles = last ? (last.distance / 1609.344).toFixed(2) : "n/a";

    return new Response(JSON.stringify({
      ytd: ytd.toFixed(1),
      weekly: weekly.toFixed(1),
      lastDate,
      lastMiles
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};
