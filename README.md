# Repository
Template repository for working group projects. 

Create a copy of this repo to get started with a new doc authored in Bikeshed (.bs).

# Setup

## Changing output folder (drafts.fidoalliance.org target)

Update the `MODULE_PATH=` value in the [Makefile](./Makefile) to specify a directory where the built files will be stored by the CI.

For example, `MODULE_PATH=credential-exchange` will result in the drafts being stored at [https://drafts.fidoalliance.org/credential-exchange/](https://drafts.fidoalliance.org/credential-exchange/)

## Modifying build targets

By default, the template repository only builds one file: [template_doc.bs](./template_doc.bs).

New build targets must be specified in the [.fido-manifesk.mk ](./.fido-manifest.mk) file by appending the filenames to the `BIKESHED_FILES` variable.

For example:
```
BIKESHED_FILES+=Biometric-Lab-Accreditation-Policy.bs
BIKESHED_FILES+=Biometrics-Requirements.bs
```
The above will result in Travis-CI trying to build the `Biometric-Lab-Accreditation-Policy.bs` and `BIKESHED_FILES+=Biometrics-Requirements.bs` files.

When adding or removing build targets from the repository, make sure to always update the [.fido-manifesk.mk ](./.fido-manifest.mk) in the same Branch or Pull request.

**Note:** Lines that start with `#` symbol are commnets and are ignored. 

### Formatting

Build targets must have a valid `<pre class='metadata'>` block in the beginning. See [template_doc.bs](./template_doc.bs), another existing repository or [bikeshed documentation](https://speced.github.io/bikeshed/) for an example.

### Typical errors

If you point BIKESHED_FILES at a file that does not exist, the build process will fail. In that case the CI log will typically show an error that looks like this:
> make[1]: *** No rule to make target 'wdr4w.md', needed by 'bikeshed-files'.  Stop.
 
The above error is saying that the file `wdr4w.md` was specified in the build targets (`BIKESHED_FILES+=wdr4w.md` in [.fido-manifesk.mk ](./.fido-manifest.mk)) but couldn't be found in the repository.

When adding or removing build targets from the repository, make sure to always update the [.fido-manifesk.mk ](./.fido-manifest.mk) in the same Branch or Pull request.