<?php

namespace Api\Middleware;

use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Slim\Psr7\Response;

class AdminMiddleware
{
    public function __invoke(Request $request, RequestHandler $handler): Response
    {
        $userRole = $request->getAttribute('user_role');
        
        if ($userRole !== 'admin') {
            $response = new Response();
            $response->getBody()->write(json_encode(['error' => 'Forbidden: Admin access required']));
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(403);
        }

        return $handler->handle($request);
    }
}
