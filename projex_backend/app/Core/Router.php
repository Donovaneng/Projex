<?php

declare(strict_types=1);
final class Router
{
  private array $routesGET = [];
  private array $routesPOST = [];
  private array $routesPUT = [];
  private array $routesDELETE = [];

  /**
   * Enregistrer une route GET
   */
  public function get(string $path, callable $handler): void
  {
    $this->routesGET[$this->normalize($path)] = $handler;
  }

  /**
   * Enregistrer une route POST
   */
  public function post(string $path, callable $handler): void
  {
    $this->routesPOST[$this->normalize($path)] = $handler;
  }

  /**
   * Enregistrer une route PUT
   */
  public function put(string $path, callable $handler): void
  {
    $this->routesPUT[$this->normalize($path)] = $handler;
  }

  /**
   * Enregistrer une route DELETE
   */
  public function delete(string $path, callable $handler): void
  {
    $this->routesDELETE[$this->normalize($path)] = $handler;
  }

  /**
   * Exécuter la route demandée
   */
  public function dispatch(string $method, string $path): void
  {
    $path = $this->normalize($path);

    $table = match ($method) {
      "POST" => $this->routesPOST,
      "PUT" => $this->routesPUT,
      "DELETE" => $this->routesDELETE,
      default => $this->routesGET,
    };

    // 1. Recherche d'un match exact
    if (isset($table[$path])) {
      $handler = $table[$path];
      $handler();
      return;
    }

    // 2. Recherche d'un match dynamique (ex: /api/users/:id)
    foreach ($table as $routePath => $handler) {
      // On utilise # comme délimiteur pour éviter d'échapper les / (car preg_quote les échappe)
      $pattern = preg_quote($routePath, '#');
      // preg_quote échappe ':' par '\:'. On le remplace par un groupe de capture.
      $pattern = preg_replace('/\\\\:([a-zA-Z0-9_]+)/', '([^/]+)', $pattern);
      $pattern = "#^" . $pattern . "$#";

      if (preg_match($pattern, $path, $matches)) {
        array_shift($matches); // Enlever le match complet
        // Appeler le handler avec les paramètres capturés
        call_user_func_array($handler, $matches);
        return;
      }
    }

    http_response_code(404);
    echo "404 - Route introuvable : " . htmlspecialchars($path);
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