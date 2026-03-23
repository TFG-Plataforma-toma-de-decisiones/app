"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path,include
from configurador import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from rest_framework.routers import DefaultRouter
router = DefaultRouter(trailing_slash=False)
router.register("languages", views.LanguageViewSet, basename='language')
router.register('projects', views.ProjectViewSet, basename='project')
urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/v1/login",TokenObtainPairView.as_view(), name='login'),
    path('api/v1/refresh', TokenRefreshView.as_view(), name='refresh'),
    path("api/v1/model",views.get_uvl_model),
    path("api/v1/recommend",views.get_recommendation,name="recommend"),
    path("api/v1/users/me",views.get_my_user),
    path("api/v1/swot",views.get_swot),
    path("api/v1/autocomplete",views.autocomplete),
    path("api/v1/manage-uvl",views.ManageUVLModelView.as_view()),
    path("api/v1/projects/draft",views.get_draft_projects),
    path("api/v1/projects/<int:id>/draft",views.DraftProjectView.as_view()),
    path("api/v1/", include(router.urls)),
]
