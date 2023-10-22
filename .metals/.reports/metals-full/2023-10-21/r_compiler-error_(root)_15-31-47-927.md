file://<WORKSPACE>/app/controllers/HomeController.scala
### scala.reflect.internal.Types$TypeError: Unsupported Scala 3 generic tuple type scala.*: in bounds of trait NonEmptyTuple; found in trait scala.NonEmptyTuple.

occurred in the presentation compiler.

action parameters:
offset: 540
uri: file://<WORKSPACE>/app/controllers/HomeController.scala
text:
```scala
package controllers

import javax.inject._
import play.api._
import play.api.mvc._

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class HomeController @Inject()(val controllerComponents: ControllerComponents) extends BaseController {
  /**
   * Create an Action to render an HTML page.
   *
   * The configuration in the `routes` file means that this method
   * will be called when the application receives a `GET` request with
   * a path of `/`.
   */
  def temp = A@@
  def index() = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.index(tui= hearthstoneMini.HearthstoneMini.tui.toString()))
  }
}

```



#### Error stacktrace:

```

```
#### Short summary: 

scala.reflect.internal.Types$TypeError: Unsupported Scala 3 generic tuple type scala.*: in bounds of trait NonEmptyTuple; found in trait scala.NonEmptyTuple.