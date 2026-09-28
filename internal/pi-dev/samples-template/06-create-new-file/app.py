"""Small CLI that needs a missing helper module."""

from utils.slugify import slugify


def main():
    title = "Hello World! This Is A Title"
    print(slugify(title))


if __name__ == "__main__":
    main()
