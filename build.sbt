name := """playframework"""
organization := "de"

version := "1.0-SNAPSHOT"
scalacOptions ++= Seq(          // use ++= to add to existing options
  "-Ytasty-reader"               // exploit "trailing comma" syntax so you can add an option without editing this line
) 
lazy val root = (project in file(".")).enablePlugins(PlayScala).enablePlugins(SbtWeb)
//generateReverseRouter := false
scalaVersion := "2.13.12"

libraryDependencies += guice
libraryDependencies += "org.scalatestplus.play" %% "scalatestplus-play" % "6.0.0-RC2" % Test
libraryDependencies += "org.webjars.npm" % "less" % "4.1.3"
libraryDependencies += "org.webjars"% "jquery" % "3.6.4"

// Adds additional packages into Twirl
//TwirlKeys.templateImports += "de.controllers._"

// Adds additional packages into conf/routes
// play.sbt.routes.RoutesKeys.routesImport += "de.binders._"
