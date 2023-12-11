package controllers

import javax.inject._
import play.api._
import play.api.mvc._
import play.twirl.api._
import hearthstoneMini.model.{Move => Move}
import hearthstoneMini.controller.{GameState => GameState}
import hearthstoneMini.model.fieldComponent.fieldImpl.{Field => Field}
import hearthstoneMini.controller.Strategy
import play.api.routing.JavaScriptReverseRouter
import play.api.libs.json._
import play.api.libs.streams.ActorFlow
import akka.actor._
import akka.actor.ActorSystem
import hearthstoneMini.util.Observer
import hearthstoneMini.util.Event

@Singleton
class HomeController @Inject()(implicit system: ActorSystem, controllerComponents: ControllerComponents) extends MainController {
  var updatedIds: List[String] = List();

  def getCards()= Action { implicit request: Request[AnyContent] =>
     var values = controller.field.players.map(player => 
          player.gamebar.hand.map(card => card.id).appendedAll(player.gamebar.deck.map(card => card.id))
     ).flatten;
    Ok(values.mkString(","))
  }
   
  
  def index() = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.welcome())
  }

  def gameRules = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.gameRules())
  }

  def game() = Action { implicit request: Request[AnyContent] =>
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
      var handSlot = request.body.asFormUrlEncoded.get("handSlotIndex").head.toInt
      var fieldSlotActive = request.body.asFormUrlEncoded.get("fieldIndex").head.toInt

      updatedIds = List(s"#field$fieldSlotActive", ".hand-active");
      controller.placeCard(Move(
        handSlot = handSlot,
        fieldSlotActive = fieldSlotActive));

      Ok(mapIdsToJson(ids = updatedIds))
  }

  def mapIdsToJson(ids: List[String]) = {
    JsObject(
        Seq(
          "ids" -> JsArray(
              ids.map[JsString](id => JsString(id)).toIndexedSeq
          )
        )
      )
  }

  def exitGame() = Action { 
    implicit request: Request[AnyContent] =>
      controller.field = new Field(5);
      controller.gameState = GameState.CHOOSEMODE;

      Ok("");
  }

  def endTurn() = Action { 
    implicit request: Request[AnyContent] =>
      updatedIds =  List(".player1", ".player2")
      controller.switchPlayer()
      Ok(mapIdsToJson(ids = updatedIds))
  }

  def drawCard() = Action { 
    implicit request: Request[AnyContent] =>
      updatedIds = List(".deckP2Background", ".hand-active");
      controller.drawCard()
      Ok(mapIdsToJson(ids = updatedIds))
  }

  def directAttack() = Action { 
    implicit request: Request[AnyContent] =>
      var fieldSlotActive = request.body.asFormUrlEncoded.get("activeFieldIndex").head.toInt
      updatedIds = List(".player2");
      controller.directAttack(Move(fieldSlotActive = fieldSlotActive))
      Ok(mapIdsToJson(ids = updatedIds))
  }

  def attack() = Action {
    implicit request: Request[AnyContent] =>
      updatedIds = List(".fieldbar-inactive", ".fieldbar-active");
      var fieldSlotActive = request.body.asFormUrlEncoded.get("activeFieldIndex").head.toInt
      var fieldSlotInactive = request.body.asFormUrlEncoded.get("inactiveFieldIndex").head.toInt
      controller.attack(Move(
        fieldSlotActive = fieldSlotActive, 
        fieldSlotInactive = fieldSlotInactive
        )
      )
      Ok(mapIdsToJson(ids = updatedIds))
  }

  def undo() = Action { 
    implicit request: Request[AnyContent] =>
      updatedIds =  List(".player1", ".player2");
      controller.undo
      Ok(mapIdsToJson(ids = updatedIds))
  }
  
  def redo() = Action { 
    implicit request: Request[AnyContent] =>
      updatedIds =  List(".player1", ".player2");
      controller.redo
      Ok(mapIdsToJson(ids = updatedIds))
  }

  object WebSocketActorFactory {
    def create(out: ActorRef) = {
      Props(new WebSocketActor(out))
    }
  }

  class WebSocketActor(out: ActorRef) extends Actor with Observer {
    controller.add(this)

    def update(e: Event, msg: Option[String]): Unit = {
      sendJsonToClient
      println("update")
    }
    
    def receive = {
      case msg: String =>
        out ! (mapIdsToJson(updatedIds).toString)
    }

    def sendJsonToClient = {
      out ! (mapIdsToJson(updatedIds).toString)
    }
  }
  
  def socket() = WebSocket.accept[String, String] { request =>
    ActorFlow.actorRef { out =>
      println("Connect received")
      WebSocketActorFactory.create(out)
    }
  }


  def jsRoutes = Action { implicit request =>
    Ok(
      JavaScriptReverseRouter("jsRoutes")(
        routes.javascript.HomeController.game,
        routes.javascript.HomeController.placeCard,
        routes.javascript.HomeController.attack,
        routes.javascript.HomeController.directAttack,
        routes.javascript.HomeController.drawCard,
        routes.javascript.HomeController.getCards,
        routes.javascript.HomeController.undo,
        routes.javascript.HomeController.redo,
        routes.javascript.HomeController.endTurn,
        routes.javascript.HomeController.exitGame,
        routes.javascript.HomeController.socket,
      )).as("text/javascript")
  }

}
