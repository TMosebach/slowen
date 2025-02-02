# Slowen

## Backend

Backend einer kleinen Finanzverwaltung.

In einer relationalen Datenbank werden Assets (insbesondere Wertpapiere), Konten und die Buchungen abgelegt. Das Backend arbeitet mit Eventsourcing. Das "abspielen" der Buchungen (Events) erzeugt, die Salden auf denen dann Reports möglich sind.

Das ganze ist aktuell noch sehr technisch:

Als Online-Schnittstelle dient eine `GraphQL`-API. Die Basisdaten können in bzw. aus Dateien ex- bzw. import werden.

Mit Hilfe der Dateien sind die jeweiligen Daten leicht zu Testzwecken gespeichert und leicht manipulieren.

## H2-Console

[http://localhost:8080/h2-console](http://localhost:8080/h2-console)

## Graph-QL-Client

[http://localhost:8080/graphiql?path=/graphql](http://localhost:8080/graphiql?path=/graphql)