@echo off
title PostgreSQL Database Manager - QA Dashboard
echo ================================================================
echo    Opening PostgreSQL Database (Port 5434)
echo ================================================================
echo.
echo Database Connection URL:
echo   postgresql://qa_user:qa_password@localhost:5434/qa_dashboard
echo.
echo Credentials:
echo   - Host / Server : localhost (Port 5434) or qa_postgres
echo   - Database      : qa_dashboard
echo   - Username      : qa_user
echo   - Password      : qa_password
echo.
echo Opening Web Database GUI (Adminer) at http://localhost:8088 ...
start "" "http://localhost:8088/?pgsql=qa_postgres&username=qa_user&db=qa_dashboard"
echo.
echo Launching interactive psql CLI terminal...
docker exec -it qa_dashboard_postgres psql -U qa_user -d qa_dashboard
pause
