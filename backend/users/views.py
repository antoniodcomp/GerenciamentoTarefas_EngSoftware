from django.http import JsonResponse

def hello_backend(request):
    return JsonResponse({
        "status": "Backend online", 
        "mensagem": "Infraestrutura inicial do Django criada com sucesso!"
    })