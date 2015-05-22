# UberNode

Use this as a template for OAuth 2.0 authentication and authorization in order to make requests on behalf of users.

Register your app via [Uber's developer site](https://developer.uber.com) (you'll need an Uber account). Make sure to keep track of the client id, client secret, and server token as environment variables.

Keep in mind that there are no database connections here, and all connection and routing logic is written in the entry point. If using a database and/or modularizing your app, write your own logic.

Don't forget to install your npm dependencies!

[Make sure to reference the Uber API docs!](https://developer.uber.com)