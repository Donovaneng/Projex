<?php

declare(strict_types=1);
final class Router
{
  private array $routesGET = [];
  private array $routesPOST = [];

  /**
   * Enregistrer une route GET (affichage d'une page)
   */
  public function get(string $path, callable $handler): void
  {
    $this->routesGET[$this->normalize($path)] = $handler;
  }

  /**
   * Enregistrer une route POST (traitement d'un formulaire)
   */
  public function post(string $path, callable $handler): void
  {
    $this->routesPOST[$this->normalize($path)] = $handler;
  }

  /**
   * Exécuter la route demandée
   * - choisit GET ou POST selon la requête
   * - lance le handler correspondant
   */
  public function dispatch(string $method, string $path): void
  {
    $path = $this->normalize($path);

    $table = ($method === "POST") ? $this->routesPOST : $this->routesGET;

    if (!isset($table[$path])) {
      http_response_code(404);
      echo "404 - Route introuvable : " . htmlspecialchars($path);
      return;
    }

    // Exécute la fonction associée à la route
    $handler = $table[$path];
    $handler();
  }

  /**
   * Normalise les routes : supprime les //, enlève le slash final, etc.
   */
  private function normalize(string $path): string
  {
    $path = "/" . trim($path, "/");
    return $path === "/" ? "/" : $path;
  }
}