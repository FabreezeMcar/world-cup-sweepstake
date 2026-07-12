exports.handler = async function(event, context) {
  try {
    const res = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
      headers: { 'X-Auth-Token': '82cfe9858b5243cfbdbe03ad06d0ef25' }
    });
    if (!res.ok) {
      return { statusCode: res.status, body: JSON.stringify({ error: 'API returned ' + res.status }) };
    }
    const data = await res.json();
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
