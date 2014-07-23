# Catapult

Catapult is a tiny web framework which reuses some concept from the more populare [Apache Sling](http://sling.apache.org/). Sling is a framework built in Java, built with REST in mind. In Sling, resource are first class citizen, and every resource can have multiple representations. I tried to borrow some concepts from Sling and apply them in Node.js, just to "bring back the fun". Sling is a more complex and reliable framework that Catapult will ever be, so if you are looking at something battle-ready for production and with a big development community, go for it.

## Install it

Since Catapult is not yet on npm, you have to install it by providing the URL of the remote archive served from GitHub.

```
npm -g install https://github.com/francescomari/catapult/archive/master.tar.gz
```

If the installation process succeded, you now have a `catapult` command available from your command line. You can use this command to serve a Catapult application from your file system.

The following sections describe what a Catapult application is and how it is structured.

## Directory structure

The default directory structure of a Catapult application is:

```
scripts/
content/
files/
index.json
```

- `index.json`: this is the access point of the application, and it is always served when a request comes hitting the root of the application. This file contains pure content, and it needs a script to be properly rendered.

- `files/` contains static files that will be served directly without any further processing.

- `content/` contains JSON files that represent the "variable part" about your application. Each piece of content contains pure information, which can be further processed and rendered in many different ways.

- `scripts/` contains script files, which are concerned about the processing and the presentation of the content. When a request comes targeting some content, the information in the content and in the URL is used to select the correct script to present some content to the user.

## Serving static files

To serve static files, just put it inside the 'files/' directory in the root of the application. Every request targeting a static file will be served immediately without further processing.

In example, let's say that a user requests the URL `/js/vendor/jquery.js`. Static files must be placed inside the 'files/' directory of your application. If a file `files/js/vendor/jquery.js` exists in your application, this file will be served directly.

## Define content

A piece of content is a JSON file containing data. This file must be saved inside tthe `content/` directory. The only piece of content which can be saved outside this folder is `index.json`, which represents the access point to your web application and must be located in the root folder.

Unless your content is not shadowed by a static file, which is always served first, the correct `.json` file which will be used when serving a request depends on the URL of the request itself. When a request is received, the URL path is decomposed in different parts:

- a content path: this is the part of the URL path comprised between the beginning and the first dot. In example, in the URL path `/a/b/c.html`, the portion representing the content path is just `/b/c`.

- an extension: this is the part of the URL which comes after the content path. In example, in the URL path `/a/b/c.html`, the portion representing the extension is `html`.

- zero or more selectors: a URL path can have a sequence of selectors between the content path and the extension, separated by dots. The selectors have been omitted from the previous examples, but if the URL path is `/a/b/c.small.summary.html`, the list of selectors is `['small', 'summary']`. As usual, for the previous URL the content path remains `/a/b/c` and the extension `html`.

- an optional suffix: this is the last part of the URL path, the one that comes after the content path, the selectors and the extension. The suffix can be used to pass additional information to the underlying system, and it has no influence on how the request is processed. In example, if the URL is `/a/b/c.html/path/to/that`, the suffix is `/path/to/that`. In the previous URL, the content path would be `/a/b/c` and the extension `html`. The previous URL has no selectors.

After the URL is decomposed, only the content path is used to locate content. If the content path is `/`, the `index.json` file is parsed from the root of the application. Otherwise, the content will be looked for in the `content/` directory. For a content path `/a/b/c`, a file is expected located at `content/a/b/c.json`. If the content cannot be located, the user will receive a 404 response.

## Render the content

For the content to be rendered appropriately, you need to define a script. The only purpose of a script is to take a resource and provide a correct representation for it. Locating a script can look a little bit daunting at first, but the algorithm is actually very straightforward.

The script is always searched for in the `script/` directory in the application. Depending on the request type (GET, POST, etc.), the type of the content, the selectors and the extension, a different script can be selected. In general, this script must be located at a path like:

```
scripts/{contentType}/{selectors}/{extension}/{method}.{scriptExtension}
```

The different components of this path are:

- `contentType`: this depend on the actual data stored in your content files. If the JSON file used as content has a property named `type`, this value will be used. The value of the `type` property can contain one or more slashses to select different subfolders. Valid values for the `type` property are `'blog'`, `'blog/post'`, `'blog/post/detail'`. If the content in the JSON file doesn't have a `type` property, the value `'default'` is used.

- `selectors`: if selectors are present in the request URL, they will be added as path components in the same order as they are specified in the URL. If the request URL has no selectors, nothing will be added to the path.

- `extension`: if the request URL has an extension, this will be added to the path as-is. If the URL doesn't contain any extension, the value `default` is used.

- `method`: this is the method of the HTTP request, in lower case.

Note that the only component that I didn't descibe is `scriptExtension`. This doesn't come from anywhere, it is up to the developer to define. This last part of the script path is used to determine how to render that script. If the `scriptExtension` is `js`, the file will be loaded as a Node module and the exported function will be used to further process the request. Otherwise, the extension will be used to locate a script engine in [consolidate.js](https://github.com/visionmedia/consolidate.js).

In example, let's say that a GET request is handled, targeting the URL path `/posts/2010/06/first.summary.html`. The content path of this URL points to a valid content file, which is evaluated as:

```json
{
  "title": "My first post",
  "author": "Myself",
  "type": "blog/post"
}
```

We have every element to build the path of the script which will be used to render this piece of content:

```
scripts/blog/post/summary/html/get.ejs
```

The last part of the script path (`ejs`) is variable, and depends on the scripting language that you want to use to write your templates. The only restriction on this extension is that it must be a valid scripting engine name understood by [consolidate.js](https://github.com/visionmedia/consolidate.js).

## License

Catapult is licensed under the MIT license.
