@echo off

@rem Check that all files have trailing spaces stripped
set OutTrailingSpaceListFile=output\knockout-files-to-clean.txt
cd ..
findstr -rsm -c:" $" * |findstr -rv "^.git" |findstr -rv ".exe$" > build\%OutTrailingSpaceListFile%
cd build
for %%R in (%OutTrailingSpaceListFile%) do if %%~zR gtr 0 goto :NeedFixTrailingSpace
rm %OutTrailingSpaceListFile%
goto :TrailingSpaceOkay

:NeedFixTrailingSpace
echo The following files have trailing spaces that need to be cleaned up:
echo.
type %OutTrailingSpaceListFile%
echo.

:TrailingSpaceOkay
