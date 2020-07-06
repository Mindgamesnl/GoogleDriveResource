async function handleStream(request) {
    const url = new URL(request.url)
    const id = url.searchParams.get('id');
    apiurl = "https://docs.google.com/uc?export=open&id=" + id;
    
    let out = await fetch(apiurl, {
        redirect: 'follow',
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36',
            'accept': 'text/html',
            'accept-language': 'en-GB,en;q=0.9,nl-NL;q=0.8,nl;q=0.7,en-US;q=0.6',
            'Content-Type': 'text/html; charset=utf-8'
        },
    });

    if (out.headers.get("set-cookie") != null && out.headers.get("set-cookie").includes("download_warning")) {
        let html = await out.text();
        html = html.split("confirm=")[1]
        html = html.split("&")[0]
        let authCookie = out.headers.get("set-cookie")
        let pu = "https://docs.google.com/u/0/uc?export=open&confirm=" + html + "&id=" + id;
        return proxyContent(pu, authCookie)
    } else {
        return Response.redirect("https://docs.google.com/uc?export=open&id=" + id, 302);
    }
}


async function proxyContent(apiurl, cookies) {
  let response = await fetch(apiurl, {
    redirect: 'follow',
     method: 'GET', // *GET, POST, PUT, DELETE, etc.
     headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36',
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'en-GB,en;q=0.9,nl-NL;q=0.8,nl;q=0.7,en-US;q=0.6',
      'Cookie': cookies
    },
  });

    let { readable, writable } = new TransformStream();
    
    response.body.pipeTo(writable);
    let out = new Response(readable, response);
    out.headers.set('Access-Control-Allow-Origin', '*')
    out.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS')
    out.headers.set('Access-Control-Allow-Headers','Content-Type')
    out.headers.append('Vary', 'Origin')
    out.headers.set('Groetjes', 'Mindgamesnl')
    return out;
}


function handleOptions(request) {
    return new Response(null, {
        headers: corsHeaders,
    });
}

addEventListener('fetch', event => {
    try {
        const request = event.request
        const url = new URL(request.url)
        let apiurl = null;

        if (request.method === 'OPTIONS') {
            // Handle CORS preflight requests
            event.respondWith(handleOptions(request))
            return;
        }

        if (
            request.method === 'GET' ||
            request.method === 'HEAD' ||
            request.method === 'POST'
        ) {
            event.respondWith(handleStream(request))
            return;
        }

        event.respondWith(async () => {
            return new Response(null, {
                status: 405,
                statusText: 'Method Not Allowed',
            })
        })
    } catch (e) {
        event.respondWith(rawHtmlResponse(e))
    }
})

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

async function rawHtmlResponse(html) {
    return new Response(html, {
        headers: {
            'content-type': 'text/html;charset=UTF-8',
        },
    })
}
