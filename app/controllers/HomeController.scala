package controllers

import javax.inject._
import play.api._
import play.api.mvc._
import hearthstoneMini.model.Move
import hearthstoneMini.controller.GameState
import hearthstoneMini.controller.Strategy

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class HomeController @Inject()(val controllerComponents: ControllerComponents) extends BaseController {
  val controller = hearthstoneMini.HearthstoneMini.hearthstoneMiniRunner.controller
  /* 
    controller.field.players.head.fieldbar.cardArea.row // Card/Field slots to map
    controller.field.players.head.gamebar.hand // Hand karten 
    controller.field.players.head.gamebar.deck // Deck 
    controller.field.players.head.gamebar.friedhof // friedhof
    controller.field.players.head.gamebar.hp
    controller.field.players.head.gamebar.mana
    */
  /**
   * Create an Action to render an HTML page.
   *
   * The configuration in the `routes` file means that this method
   * will be called when the application receives a `GET` request with
   * a path of `/`.
   */

  def index() = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.welcome())
  }

  def game = Action { implicit request: Request[AnyContent] =>
    Ok(controller.gameState match {
                case GameState.CHOOSEMODE => views.html.gamemode()
                case GameState.ENTERPLAYERNAMES => views.html.game(msg = controller.errorMsg.get)(controller = controller)
                case GameState.MAINGAME => views.html.game(msg = controller.errorMsg.getOrElse(controller.field.players(0).name +  hearthstoneMini.aview.Strings.istDranMsg))(controller = controller)
                case GameState.WIN => views.html.game(msg = controller.getWinner().get + hearthstoneMini.aview.Strings.gewonnenMsg)(controller = controller)
                case GameState.EXIT => views.html.game(msg = "")(controller = controller)
            }
      )
  }

  def initGame() = Action {
    implicit request: Request[AnyContent] => 
      controller.setStrategy(
        (request.body.asFormUrlEncoded.get("gamemode").head).toInt match {
          case 1 => Strategy.normal
          case 2 => Strategy.hardcore
          case 3 => Strategy.debug
        }
      )
      controller.setPlayerNames(Move(p1 = request.body.asFormUrlEncoded.get("playerName1").head, p2 = request.body.asFormUrlEncoded.get("playerName2").head))
      Redirect("/hearthstoneMini")
  }

  def placeCard() = Action { 
    implicit request: Request[AnyContent] =>
      controller.placeCard(hearthstoneMini.model.Move(handSlot = request.body.asFormUrlEncoded.get("handSlotIndex").head.toInt, fieldSlotActive = request.body.asFormUrlEncoded.get("fieldIndex").head.toInt))
      Redirect("/hearthstoneMini")
  }
  def exitGame() = Action { 
    controller.exitGame()
    
    implicit request: Request[AnyContent] =>
    Redirect("/hearthstoneMini")
  }
  def endTurn() = Action { 
    controller.switchPlayer()
    
    implicit request: Request[AnyContent] =>
    Redirect("/hearthstoneMini")
  }
  def drawCard() = Action { 
    controller.drawCard()
    
    implicit request: Request[AnyContent] =>
    Redirect("/hearthstoneMini")
  }
  def directAttack() = Action { 
    implicit request: Request[AnyContent] =>
      controller.directAttack(hearthstoneMini.model.Move(fieldSlotActive = request.body.asFormUrlEncoded.get("activeFieldIndex").head.toInt))
      Redirect("/hearthstoneMini")
  }
  def attack() = Action {
    implicit request: Request[AnyContent] =>
      controller.attack(hearthstoneMini.model.Move(fieldSlotActive = request.body.asFormUrlEncoded.get("activeFieldIndex").head.toInt, fieldSlotInactive = request.body.asFormUrlEncoded.get("inactiveFieldIndex").head.toInt)) 
      Redirect("/hearthstoneMini")
  }
  def undo() = Action { 
    controller.undo
    
    implicit request: Request[AnyContent] =>
    Redirect("/hearthstoneMini")
  }
  def redo() = Action { 
    controller.redo
    
    implicit request: Request[AnyContent] =>
    Redirect("/hearthstoneMini")
  }
}
