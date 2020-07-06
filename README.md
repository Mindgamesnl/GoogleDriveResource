# GoogleDriveResource
A simple HTTP proxy that fetches raw google drive resources (images, video, audio, and whatever) and bypasses the virus warning if the file size is over 200MB to still deliver the content. Intended to be run in a CloudFlare worker.

It works by fetching the base content, checking if a cookie is present, if it is, then it parses the html to get the token, and then makes a second proxy request with the authentication token, cookies and ip. The token and cookie are only valid from the same IP address that requested the resource in the fist request, hence the proxy instead of redirecting to the resource.
