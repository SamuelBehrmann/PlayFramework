package controllers

import com.google.inject.Inject
import akka.actor.ActorSystem
import play.api.mvc.ControllerComponents
import play.api.mvc.BaseController

abstract class MainController @Inject()(implicit system: ActorSystem, val controllerComponents: ControllerComponents) extends BaseController {
    val controller = hearthstoneMini.HearthstoneMini.hearthstoneMiniRunner.controller

}