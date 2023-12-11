package controllers

import javax.inject._
import play.api._
import play.api.mvc._
import play.twirl.api._
import hearthstoneMini.model.{Move => Move}
import hearthstoneMini.controller.{GameState => GameState}
import hearthstoneMini.model.fieldComponent.fieldImpl.{Field => Field}
import hearthstoneMini.controller.Strategy
import play.api.libs.streams.ActorFlow
import akka.actor._
import akka.actor.ActorSystem
import hearthstoneMini.util.Observer
import hearthstoneMini.util.Event

@Singleton
class VueApiController @Inject()(implicit val system: ActorSystem, controllerComponents: ControllerComponents) extends MainController {
    
    def game() = Action { implicit request: Request[AnyContent] =>
        Ok(controller.field.toJson)
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
        Ok("")
    }

    def placeCard() = Action { 
      implicit request: Request[AnyContent] =>
        var handSlot = request.body.asFormUrlEncoded.get("handSlotIndex").head.toInt
        var fieldSlotActive = request.body.asFormUrlEncoded.get("fieldIndex").head.toInt

        controller.placeCard(Move(handSlot = handSlot,fieldSlotActive = fieldSlotActive));

        Ok("")
    }

    def exitGame() = Action { 
      implicit request: Request[AnyContent] =>
        controller.field = new Field(5);
        controller.gameState = GameState.CHOOSEMODE;
        controller.notifyObservers(Event.PLAY, msg = None)
        Ok("");
    }

    def endTurn() = Action { 
      implicit request: Request[AnyContent] =>
        controller.switchPlayer()
        Ok("")
    }

    def drawCard() = Action { 
      implicit request: Request[AnyContent] =>
        controller.drawCard()
        Ok("")
    }

    def directAttack() = Action { 
      implicit request: Request[AnyContent] =>
        var fieldSlotActive = request.body.asFormUrlEncoded.get("activeFieldIndex").head.toInt
        controller.directAttack(Move(fieldSlotActive = fieldSlotActive))
        Ok("")
    }

    def attack() = Action {
      implicit request: Request[AnyContent] =>
        var fieldSlotActive = request.body.asFormUrlEncoded.get("activeFieldIndex").head.toInt
        var fieldSlotInactive = request.body.asFormUrlEncoded.get("inactiveFieldIndex").head.toInt
        controller.attack(Move(
          fieldSlotActive = fieldSlotActive, 
          fieldSlotInactive = fieldSlotInactive
          )
        )
        Ok("")
    }

    def undo() = Action { 
      implicit request: Request[AnyContent] =>
        controller.undo
        Ok("")
    }
    
    def redo() = Action { 
      implicit request: Request[AnyContent] =>
        controller.redo
        Ok("")
    }

      
    object WebSocketActorFactory {
        def create(out: ActorRef) = {
            Props(new SocketActor(out))
        }
    }

    def socket() = WebSocket.accept[String, String] { request =>
      ActorFlow.actorRef { out =>
        println("Vue Connect received")
        WebSocketActorFactory.create(out)
      }
    }

    class SocketActor(out: ActorRef) extends Actor with Observer {
      controller.add(this)

      def update(e: Event, msg: Option[String]): Unit = {
        println("Update Vue")
        sendJsonToClient
      }
      
      def receive = {
        case msg: String =>
          out ! (controller.field.toJson.toString)
      }

      def sendJsonToClient = {
        out ! (controller.field.toJson.toString)
      }
    }
  }